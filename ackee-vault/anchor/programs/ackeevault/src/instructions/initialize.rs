use crate::VaultState;
use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

#[derive(Accounts)]
#[instruction(vault_id:u16)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    #[account(
        init,
        payer=maker,
        space= 8 + VaultState::INIT_SPACE,
        seeds=[b"vault_state",maker.key().as_ref(),vault_id.to_le_bytes().as_ref()],
        bump
    )]
    pub vault_state: Account<'info, VaultState>,
    #[account(
        mut,
        seeds=[b"vault",vault_state.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

impl<'info> Initialize<'info> {
    pub fn handler(&mut self, vault_id: u16, bumps: &InitializeBumps) -> Result<()> {
        // Initialize System account & deposit Rent to make it Rent exempted
        let rent_exempt = Rent::get()?.minimum_balance(self.vault.data_len());
        let cpi_program = self.system_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.maker.to_account_info(),
            to: self.vault.to_account_info(),
        };
        let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
        transfer(cpi_context, rent_exempt)?;
        // Set the vault_state account
        self.vault_state.vault_id = vault_id;
        self.vault_state.vault_bump = bumps.vault;
        self.vault_state.state_bump = bumps.vault_state;
        Ok(())
    }
}
