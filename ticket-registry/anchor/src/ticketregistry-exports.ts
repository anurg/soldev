// Here we export some useful types and functions for interacting with the Anchor program.
import TicketregistryIDL from '../target/idl/ticketregistry.json'

// Re-export the generated IDL and type
export { TicketregistryIDL }

export * from './client/js'
