use anchor_lang::prelude::*;
pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

pub use instructions::*;
pub use state::*;

declare_id!("JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H");

#[program]
pub mod ticketregistry {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        name: String,
        description: String,
        ticket_price: u64,
        available_tickets: u64,
        start_date: i64,
    ) -> Result<()> {
        ctx.accounts.init(
            name,
            description,
            ticket_price,
            available_tickets,
            start_date,
        )?;

        Ok(())
    }
    pub fn buy(ctx: Context<BuyContext>) -> Result<()> {
        _buy(ctx)
    }

    pub fn withdraw(ctx: Context<WithdrawContext>, amount: u64) -> Result<()> {
        _withdraw(ctx, amount)
    }
}
