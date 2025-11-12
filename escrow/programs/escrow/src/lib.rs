pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("2wEGsaYr6qRVG1MBkbATSHeJ7EMmxNVUV8mf2JVSc2hg");

#[program]
pub mod escrow {
    use super::*;

    pub fn initialize(ctx: Context<Make>) -> Result<()> {
        Ok(())
    }
}
