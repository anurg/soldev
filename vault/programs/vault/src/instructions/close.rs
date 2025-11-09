use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};

use crate::VaultState;
#[derive(Accounts)]
#[instruction(vault_id:u16)]
pub struct Close<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    #[account(
        mut,
        close=maker,
        seeds=[b"vault_state",maker.key().as_ref(),vault_id.to_le_bytes().as_ref()],
        bump=vault_state.state_bump
    )]
    pub vault_state: Account<'info, VaultState>,
    #[account(
        mut,
        seeds=[b"vault",vault_state.key().as_ref()],
        bump=vault_state.vault_bump,
    )]
    pub vault: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}
impl<'info> Close<'info> {
    pub fn close(&mut self, vault_id: u16) -> Result<()> {
        let cpi_program = self.system_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.vault.to_account_info(),
            to: self.maker.to_account_info(),
        };
        let seeds = &[
            b"vault".as_ref(),
            self.vault_state.to_account_info().key.as_ref(),
            &[self.vault_state.vault_bump],
        ];
        let signer_seeds = &[&seeds[..]];
        let cpi_context = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        transfer(cpi_context, self.vault.lamports())
    }
}
