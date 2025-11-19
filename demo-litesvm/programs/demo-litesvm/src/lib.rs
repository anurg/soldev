use anchor_lang::prelude::*;

declare_id!("C2rLZ2zKViM5SiCdPqRuKNd6gZ84QFxTh26QNqVQRMyQ");

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
