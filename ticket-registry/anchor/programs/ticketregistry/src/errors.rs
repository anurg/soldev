use anchor_lang::prelude::*;

#[error_code]
pub enum TicketRegistryError {
    #[msg("Name Too Long")]
    NameTooLong,
    #[msg("Description Too Long")]
    DescriptionTooLong,
    #[msg("Start Date is in the Past")]
    StartDateInThePast,
    #[msg("Available Tickets is too low")]
    AvaialbeTicketsTooLow,
    #[msg("All Tickets Sold Out")]
    AllTicketsSoldOut,
}
