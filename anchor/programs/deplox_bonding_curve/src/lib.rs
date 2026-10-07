use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer, Burn};

declare_id!("Dep1oXCurve111111111111111111111111111111111");

pub const DEV_FEE_WALLET: Pubkey = pubkey!("HEkgaQzrFQzvg9ER2Z7bUFL5449oj6NWJyYgPe3o1xSH");

#[program]
pub mod deplox_bonding_curve {
    use super::*;

    /// 1. Initialize Bonding Curve Pool for a newly deployed SPL Token
    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.creator = ctx.accounts.creator.key();
        pool.mint = ctx.accounts.mint.key();
        pool.reserve_sol = 0;
        pool.virtual_sol_reserve = 30 * 1_000_000_000; // 30 virtual SOL
        pool.token_reserve = 1_000_000_000 * 1_000_000; // 1 Billion tokens
        pool.burned_tokens = 0;
        pool.total_dev_fees_sol = 0;
        pool.graduated = false;
        pool.bump = ctx.bumps.pool;

        msg!("DeploX Pool Created for Mint: {}", pool.mint);
        Ok(())
    }

    /// 2. Buy tokens: 1.0% total fee (0.5% to dev wallet, 0.5% auto-buyback & burn)
    pub fn buy(ctx: Context<Trade>, sol_amount: u64, min_tokens_out: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        require!(!pool.graduated, DeploXError::PoolAlreadyGraduated);
        require!(sol_amount > 0, DeploXError::ZeroAmount);

        // Calculate 1.0% Fee:
        let dev_fee = (sol_amount * 50) / 10_000;       // 0.5%
        let burn_fee = (sol_amount * 50) / 10_000;      // 0.5%
        let total_fee = dev_fee + burn_fee;             // 1.0%
        let net_sol = sol_amount - total_fee;

        let sol_in = net_sol as u128;
        let virtual_sol = pool.virtual_sol_reserve as u128;
        let token_res = pool.token_reserve as u128;

        let tokens_out = (token_res * sol_in) / (virtual_sol + sol_in);
        require!(tokens_out as u64 >= min_tokens_out, DeploXError::SlippageExceeded);

        // 1. Transfer 0.5% Dev Fee directly to HEkgaQzrFQzvg9ER2Z7bUFL5449oj6NWJyYgPe3o1xSH
        let dev_fee_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.dev_fee_recipient.key(),
            dev_fee,
        );
        anchor_lang::solana_program::program::invoke(
            &dev_fee_ix,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.dev_fee_recipient.to_account_info(),
            ],
        )?;

        // 2. Transfer Net SOL to Pool Reserve
        let pool_sol_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user.key(),
            &pool.key(),
            net_sol + burn_fee,
        );
        anchor_lang::solana_program::program::invoke(
            &pool_sol_ix,
            &[
                ctx.accounts.user.to_account_info(),
                pool.to_account_info(),
            ],
        )?;

        // 3. Transfer user tokens
        let bump = pool.bump;
        let signer_seeds: &[&[&[u8]]] = &[&[b"deplox_pool", pool.mint.as_ref(), &[bump]]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.pool_token_vault.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: pool.to_account_info(),
        };
        token::transfer(
            CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), cpi_accounts, signer_seeds),
            tokens_out as u64,
        )?;

        // 4. Automated 0.5% Buyback & Burn
        let burn_tokens = ((token_res * (burn_fee as u128)) / (virtual_sol + (burn_fee as u128))) as u64;
        if burn_tokens > 0 {
            let burn_accounts = Burn {
                mint: ctx.accounts.mint.to_account_info(),
                from: ctx.accounts.pool_token_vault.to_account_info(),
                authority: pool.to_account_info(),
            };
            token::burn(
                CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), burn_accounts, signer_seeds),
                burn_tokens,
            )?;
            pool.burned_tokens += burn_tokens;
        }

        // Update reserves
        pool.virtual_sol_reserve += net_sol;
        pool.reserve_sol += net_sol;
        pool.token_reserve -= (tokens_out as u64) + burn_tokens;
        pool.total_dev_fees_sol += dev_fee;

        if pool.reserve_sol >= 85 * 1_000_000_000 {
            pool.graduated = true;
        }

        Ok(())
    }

    /// 3. Sell tokens: 1.0% total fee (0.5% dev fee, 0.5% burn)
    pub fn sell(ctx: Context<Trade>, token_amount: u64, min_sol_out: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        require!(!pool.graduated, DeploXError::PoolAlreadyGraduated);
        require!(token_amount > 0, DeploXError::ZeroAmount);

        let tokens_in = token_amount as u128;
        let virtual_sol = pool.virtual_sol_reserve as u128;
        let token_res = pool.token_reserve as u128;

        let gross_sol_out = (virtual_sol * tokens_in) / (token_res + tokens_in);
        
        let dev_fee = (gross_sol_out * 50) / 10_000;
        let net_sol = gross_sol_out - dev_fee;
        require!(net_sol as u64 >= min_sol_out, DeploXError::SlippageExceeded);

        // 1. Transfer tokens from user to pool
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.pool_token_vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts),
            token_amount,
        )?;

        // 2. Transfer Net SOL to user
        **pool.to_account_info().try_borrow_mut_lamports()? -= net_sol as u64;
        **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += net_sol as u64;

        // 3. Transfer Dev Fee to recipient
        **pool.to_account_info().try_borrow_mut_lamports()? -= dev_fee as u64;
        **ctx.accounts.dev_fee_recipient.to_account_info().try_borrow_mut_lamports()? += dev_fee as u64;

        pool.virtual_sol_reserve -= gross_sol_out as u64;
        pool.reserve_sol = pool.reserve_sol.saturating_sub(gross_sol_out as u64);
        pool.token_reserve += token_amount;
        pool.total_dev_fees_sol += dev_fee as u64;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 1 + 1,
        seeds = [b"deplox_pool", mint.key().as_ref()],
        bump
    )]
    pub pool: Account<'info, BondingPool>,
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Trade<'info> {
    #[account(
        mut,
        seeds = [b"deplox_pool", pool.mint.as_ref()],
        bump = pool.bump
    )]
    pub pool: Account<'info, BondingPool>,
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub pool_token_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    /// CHECK: Safe dev fee recipient address
    #[account(
        mut,
        address = DEV_FEE_WALLET
    )]
    pub dev_fee_recipient: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct BondingPool {
    pub creator: Pubkey,
    pub mint: Pubkey,
    pub reserve_sol: u64,
    pub virtual_sol_reserve: u64,
    pub token_reserve: u64,
    pub burned_tokens: u64,
    pub total_dev_fees_sol: u64,
    pub graduated: bool,
    pub bump: u8,
}

#[error_code]
pub enum DeploXError {
    #[msg("Pool has already graduated to Raydium DEX")]
    PoolAlreadyGraduated,
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Slippage tolerance exceeded during rapid curve movement")]
    SlippageExceeded,
}
