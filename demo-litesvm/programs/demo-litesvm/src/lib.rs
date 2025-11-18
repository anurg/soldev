use anchor_lang::prelude::*;

declare_id!("8dLLfZPa3SbUnYooW9uj3Q264n2KdoZxpPPqyiReQ4R9");

#[program]
pub mod demo_litesvm {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
