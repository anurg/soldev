use crate::constants::*;
use crate::errors::*;
use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(name:String)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub event_organizer: Signer<'info>,
    #[account(
        init,
        payer = event_organizer,
        space = 8 + Event::INIT_SPACE,
        seeds = [b"event",name.as_bytes(),event_organizer.key().as_ref()],
        bump
    )]
    pub event: Account<'info, Event>,
    pub system_program: Program<'info, System>,
}

impl<'info> Initialize<'info> {
    pub fn init(
        &mut self,
        name: String,
        description: String,
        ticket_price: u64,
        available_tickets: u64,
        start_date: i64,
    ) -> Result<()> {
        require!(name.len() <= MAX_NAME_LEN, TicketRegistryError::NameTooLong);
        require!(
            description.len() <= MAX_DESCRIPTION_LEN,
            TicketRegistryError::DescriptionTooLong
        );
        require!(
            available_tickets > 0,
            TicketRegistryError::AvaialbeTicketsTooLow
        );
        require!(
            start_date > Clock::get()?.unix_timestamp,
            TicketRegistryError::StartDateInThePast
        );
        self.event.name = name;
        self.event.description = description;
        self.event.ticket_price = ticket_price;
        self.event.available_tickets = available_tickets;
        self.event.start_date = start_date;
        Ok(())
    }
}
