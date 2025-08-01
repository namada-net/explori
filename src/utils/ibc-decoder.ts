import { 
    MsgRecvPacket, 
    MsgAcknowledgement, 
    MsgTimeout, 
    MsgTimeoutOnClose,
  } from '../ibc-proto/ibc/core/channel/v1/tx';
  import { 
    MsgSendPacket,
  } from '../ibc-proto/ibc/core/channel/v2/tx';
  import { 
    MsgUpdateClient,
    MsgCreateClient,
    // Import client message types
  } from '../ibc-proto/ibc/core/client/v1/tx';
  import { 
    Header as TendermintHeader,
    ClientState as TendermintClientState,
    ConsensusState as TendermintConsensusState,
  } from '../ibc-proto/ibc/lightclients/tendermint/v1/tendermint';
  import { 
    Any,
  } from '../ibc-proto/google/protobuf/any';
  
  export class IbcDecoder {
    /**
     * Decode hex string to IBC message
     */
    static decodeHexMessage(hexData: string): DecodedIbcMessage {
        try {
          // Remove "0x" prefix if present
          const cleanHex = hexData.startsWith('0x') ? hexData.slice(2) : hexData;
          
          // Convert hex to Uint8Array
          const bytes = this.hexToBytes(cleanHex);
          // Try to decode as different IBC message types with validation
          const decoded = this.tryDecodeMessageWithValidation(bytes);
          
          if (decoded) {
            return decoded;
          }
          
          throw new Error('Could not decode as any known IBC message type');
        } catch (error) {
          console.error('Failed to decode IBC message:', error);
          throw error;
        }
      }
    
      /**
       * Try to decode bytes with validation
       */
      private static tryDecodeMessageWithValidation(bytes: Uint8Array): DecodedIbcMessage | null {
        // First, try to decode as an Any type - this is the most common case
        try {
          const anyMessage = Any.decode(bytes);
          
          // Now try to decode the Any value as different IBC message types
          const messageTypes = [
            { name: 'MsgRecvPacket', decoder: MsgRecvPacket, type: 'MsgRecvPacket' as const },
            { name: 'MsgAcknowledgement', decoder: MsgAcknowledgement, type: 'MsgAcknowledgement' as const },
            { name: 'MsgTimeout', decoder: MsgTimeout, type: 'MsgTimeout' as const },
            { name: 'MsgTimeoutOnClose', decoder: MsgTimeoutOnClose, type: 'MsgTimeoutOnClose' as const },
            { name: 'MsgSendPacket', decoder: MsgSendPacket, type: 'MsgSendPacket' as const },
            { name: 'MsgUpdateClient', decoder: MsgUpdateClient, type: 'MsgUpdateClient' as const },
            { name: 'MsgCreateClient', decoder: MsgCreateClient, type: 'MsgCreateClient' as const },
          ];
      
          // First, try to decode based on the typeUrl from the Any message
          const typeUrl = anyMessage.typeUrl;
          
          // Map typeUrl to the appropriate decoder
          let targetDecoder: any = null;
          let targetName = '';
          
          switch (typeUrl) {
            case '/ibc.lightclients.tendermint.v1.Header':
              targetDecoder = TendermintHeader;
              targetName = 'TendermintHeader';
              break;
            case '/ibc.lightclients.tendermint.v1.ClientState':
              targetDecoder = TendermintClientState;
              targetName = 'TendermintClientState';
              break;
            case '/ibc.lightclients.tendermint.v1.ConsensusState':
              targetDecoder = TendermintConsensusState;
              targetName = 'TendermintConsensusState';
              break;
            case '/ibc.core.channel.v1.MsgRecvPacket':
              targetDecoder = MsgRecvPacket;
              targetName = 'MsgRecvPacket';
              break;
            case '/ibc.core.channel.v1.MsgAcknowledgement':
              targetDecoder = MsgAcknowledgement;
              targetName = 'MsgAcknowledgement';
              break;
            case '/ibc.core.channel.v1.MsgTimeout':
              targetDecoder = MsgTimeout;
              targetName = 'MsgTimeout';
              break;
            case '/ibc.core.channel.v1.MsgTimeoutOnClose':
              targetDecoder = MsgTimeoutOnClose;
              targetName = 'MsgTimeoutOnClose';
              break;
            case '/ibc.core.channel.v2.MsgSendPacket':
              targetDecoder = MsgSendPacket;
              targetName = 'MsgSendPacket';
              break;
            case '/ibc.core.client.v1.MsgUpdateClient':
              targetDecoder = MsgUpdateClient;
              targetName = 'MsgUpdateClient';
              break;
            case '/ibc.core.client.v1.MsgCreateClient':
              targetDecoder = MsgCreateClient;
              targetName = 'MsgCreateClient';
              break;
            default:
              // Unknown typeUrl, will try fallback decoding
              break;
          }
          
          if (targetDecoder && targetName) {
            try {
              const message = targetDecoder.decode(anyMessage.value);
              
              // Validate that we got meaningful data
              const isValid = this.validateMessage(message, targetName);
              
              if (isValid) {
                return {
                  type: targetName,
                  message: message,
                  rawBytes: bytes,
                  wrappedInAny: true,
                  anyTypeUrl: anyMessage.typeUrl
                };
              }
            } catch (e) {
              // Failed to decode with typeUrl, will try fallback
            }
          }
          
          // Fallback: try all known decoders if typeUrl didn't match or decoding failed
          for (const { name, decoder } of messageTypes) {
            try {
              const message = decoder.decode(anyMessage.value);
              
              // Validate that we got meaningful data
              const isValid = this.validateMessage(message, name);
              
              if (isValid) {
                return {
                  type: name,
                  message: message,
                  rawBytes: bytes,
                  wrappedInAny: true,
                  anyTypeUrl: anyMessage.typeUrl
                };
              }
            } catch (e) {
              continue;
            }
          }
          
          // If we couldn't decode the Any value as any known type, return the Any message itself
          return {
            type: 'Any',
            message: anyMessage,
            rawBytes: bytes,
            wrappedInAny: false
          };
          
        } catch (e) {
          // Failed to decode as Any type, will try direct decoding
        }
        
        // If Any decoding failed, try direct decoding as IBC message types
        const messageTypes = [
          { name: 'MsgRecvPacket', decoder: MsgRecvPacket, type: 'MsgRecvPacket' as const },
          { name: 'MsgAcknowledgement', decoder: MsgAcknowledgement, type: 'MsgAcknowledgement' as const },
          { name: 'MsgTimeout', decoder: MsgTimeout, type: 'MsgTimeout' as const },
          { name: 'MsgTimeoutOnClose', decoder: MsgTimeoutOnClose, type: 'MsgTimeoutOnClose' as const },
          { name: 'MsgSendPacket', decoder: MsgSendPacket, type: 'MsgSendPacket' as const },
          { name: 'MsgUpdateClient', decoder: MsgUpdateClient, type: 'MsgUpdateClient' as const },
          { name: 'MsgCreateClient', decoder: MsgCreateClient, type: 'MsgCreateClient' as const },
        ];
    
        for (const { name, decoder } of messageTypes) {
          try {
            const message = decoder.decode(bytes);
            
            // Validate that we got meaningful data
            const isValid = this.validateMessage(message, name);
            
            if (isValid) {
              return {
                type: name,
                message: message,
                rawBytes: bytes,
                wrappedInAny: false
              };
            }
          } catch (e) {
            continue;
          }
        }
    
        return null;
      }
    
      /**
       * Validate that a decoded message has meaningful data
       */
      private static validateMessage(message: any, type: string): boolean {
        switch (type) {
          case 'MsgRecvPacket':
            const recv = message as MsgRecvPacket;
            const packet = recv.packet;
            return !!(packet && (
              packet.sourcePort || 
              packet.sourceChannel || 
              Number(packet.sequence) > 0
            ));
    
          case 'MsgAcknowledgement':
            const ack = message as MsgAcknowledgement;
            const ackPacket = ack.packet;
            return !!(ackPacket && (
              ackPacket.sourcePort || 
              ackPacket.sourceChannel || 
              Number(ackPacket.sequence) > 0
            ));
    
          case 'MsgTimeout':
            const timeout = message as MsgTimeout;
            const timeoutPacket = timeout.packet;
            return !!(timeoutPacket && (
              timeoutPacket.sourcePort || 
              timeoutPacket.sourceChannel || 
              Number(timeoutPacket.sequence) > 0
            ));
    
          case 'MsgUpdateClient':
            const update = message as MsgUpdateClient;
            return !!(update.clientId && update.clientId.length > 0);
    
          case 'MsgCreateClient':
            const create = message as MsgCreateClient;
            return !!(create.clientState || create.consensusState);
    
          case 'TendermintHeader':
            const header = message as any;
            return !!(header.signedHeader || header.validatorSet || header.trustedHeight);
    
          case 'TendermintClientState':
            const clientState = message as any;
            return !!(clientState.chainId && clientState.chainId.length > 0);
    
          case 'TendermintConsensusState':
            const consensusState = message as any;
            return !!(consensusState.timestamp || consensusState.root || consensusState.nextValidatorsHash);
    
          default:
            return false;
        }
      }

             /**
        * Decode nested Any type in any IBC message
        */
       static decodeNestedAny(anyMessage: Any): DecodedNestedMessage | null {
         if (!anyMessage.typeUrl || !anyMessage.value) {
           return null;
         }

         try {
           // Handle different type URLs
           switch (anyMessage.typeUrl) {
             case '/ibc.lightclients.tendermint.v1.Header':
               const tmHeader = TendermintHeader.decode(anyMessage.value);
               return {
                 type: 'TendermintHeader',
                 message: tmHeader,
                 typeUrl: anyMessage.typeUrl
               };

             case '/ibc.lightclients.tendermint.v1.ClientState':
               const tmClientState = TendermintClientState.decode(anyMessage.value);
               return {
                 type: 'TendermintClientState',
                 message: tmClientState,
                 typeUrl: anyMessage.typeUrl
               };

             case '/ibc.lightclients.tendermint.v1.ConsensusState':
               const tmConsensusState = TendermintConsensusState.decode(anyMessage.value);
               return {
                 type: 'TendermintConsensusState',
                 message: tmConsensusState,
                 typeUrl: anyMessage.typeUrl
               };

             default:
               return null;
           }
         } catch (error) {
           console.error('Failed to decode nested Any:', error);
           return null;
         }
       }

      /**
       * Extract all nested Any messages from an IBC message
       */
      static extractNestedMessages(message: any, messageType: string): NestedMessageInfo[] {
        const nestedMessages: NestedMessageInfo[] = [];

        switch (messageType) {
          case 'MsgUpdateClient':
            const updateMsg = message as MsgUpdateClient;
            let clientMessageAny = updateMsg.clientMessage;
            // If clientMessage is a Uint8Array, decode as Any
            if (clientMessageAny && clientMessageAny instanceof Uint8Array) {
              clientMessageAny = Any.decode(clientMessageAny);
            }
            if (clientMessageAny) {
              const nested = this.decodeNestedAny(clientMessageAny);
              if (nested) {
                nestedMessages.push({
                  type: nested.type,
                  typeUrl: nested.typeUrl,
                  message: nested.message,
                  fieldName: 'clientMessage'
                });
              }
            }
            break;

          case 'MsgCreateClient':
            const createMsg = message as MsgCreateClient;
            let clientStateAny = createMsg.clientState;
            let consensusStateAny = createMsg.consensusState;
            if (clientStateAny && clientStateAny instanceof Uint8Array) {
              clientStateAny = Any.decode(clientStateAny);
            }
            if (consensusStateAny && consensusStateAny instanceof Uint8Array) {
              consensusStateAny = Any.decode(consensusStateAny);
            }
            if (clientStateAny) {
              const nested = this.decodeNestedAny(clientStateAny);
              if (nested) {
                nestedMessages.push({
                  type: nested.type,
                  typeUrl: nested.typeUrl,
                  message: nested.message,
                  fieldName: 'clientState'
                });
              }
            }
            if (consensusStateAny) {
              const nested = this.decodeNestedAny(consensusStateAny);
              if (nested) {
                nestedMessages.push({
                  type: nested.type,
                  typeUrl: nested.typeUrl,
                  message: nested.message,
                  fieldName: 'consensusState'
                });
              }
            }
            break;

          case 'MsgRecvPacket':
            const recvMsg = message as MsgRecvPacket;
            // Check if packet data contains Any types
            if (recvMsg.packet?.data) {
              // Packet data might contain application-specific Any messages
              // This would depend on the specific application (transfer, ICA, etc.)
              try {
                const packetDataAny = Any.decode(recvMsg.packet.data);
                const nested = this.decodeNestedAny(packetDataAny);
                if (nested) {
                  nestedMessages.push({
                    type: nested.type,
                    typeUrl: nested.typeUrl,
                    message: nested.message,
                    fieldName: 'packet.data'
                  });
                }
              } catch (e) {
                this.findAnyFields(recvMsg.packet, nestedMessages, 'packet');
              }
            } else {
              // Search for Any fields in the packet structure
              this.findAnyFields(recvMsg.packet, nestedMessages, 'packet');
            }
            break;

          case 'MsgAcknowledgement':
            const ackMsg = message as MsgAcknowledgement;
            if (ackMsg.acknowledgement) {
              // Acknowledgement might contain Any types
              try {
                const ackAny = Any.decode(ackMsg.acknowledgement);
                const nested = this.decodeNestedAny(ackAny);
                if (nested) {
                  nestedMessages.push({
                    type: nested.type,
                    typeUrl: nested.typeUrl,
                    message: nested.message,
                    fieldName: 'acknowledgement'
                  });
                }
              } catch (e) {
                this.findAnyFields(ackMsg, nestedMessages);
              }
            } else {
              this.findAnyFields(ackMsg, nestedMessages);
            }
            break;

          case 'MsgTimeout':
            const timeoutMsg = message as MsgTimeout;
            // Search for Any fields in the timeout message
            this.findAnyFields(timeoutMsg, nestedMessages);
            break;

          case 'MsgTimeoutOnClose':
            const timeoutOnCloseMsg = message as MsgTimeoutOnClose;
            // Search for Any fields in the timeout on close message
            this.findAnyFields(timeoutOnCloseMsg, nestedMessages);
            break;

          case 'MsgSendPacket':
            const sendMsg = message as MsgSendPacket;
            // Search for Any fields in the send packet message
            this.findAnyFields(sendMsg, nestedMessages);
            break;

          case 'TendermintHeader':
            const headerMsg = message as any;
            // Extract nested Any messages from the header structure
            if (headerMsg.signedHeader) {
              this.findAnyFields(headerMsg.signedHeader, nestedMessages, 'signedHeader');
            }
            if (headerMsg.validatorSet) {
              this.findAnyFields(headerMsg.validatorSet, nestedMessages, 'validatorSet');
            }
            if (headerMsg.trustedValidators) {
              this.findAnyFields(headerMsg.trustedValidators, nestedMessages, 'trustedValidators');
            }
            break;

          default:
            // For other message types, check for Any fields
            this.findAnyFields(message, nestedMessages);
            break;
        }

        return nestedMessages;
      }

      /**
       * Recursively find Any fields in an object
       */
      private static findAnyFields(obj: any, nestedMessages: NestedMessageInfo[], prefix: string = ''): void {
        if (!obj || typeof obj !== 'object') return;

        for (const [key, value] of Object.entries(obj)) {
          const fieldPath = prefix ? `${prefix}.${key}` : key;
          if (value && typeof value === 'object') {
            // If value is a Uint8Array, try to decode as Any
            if (value instanceof Uint8Array) {
              try {
                const maybeAny = Any.decode(value);
                if (maybeAny && maybeAny.typeUrl && maybeAny.value) {
                  const nested = this.decodeNestedAny(maybeAny);
                  if (nested) {
                    nestedMessages.push({
                      type: nested.type,
                      typeUrl: nested.typeUrl,
                      message: nested.message,
                      fieldName: fieldPath
                    });
                  }
                  continue; // Don't recurse into the raw bytes
                }
              } catch (e) {
                // Not a valid Any, fall through
              }
            }
            // Check if this looks like an Any type (already decoded)
            if ('typeUrl' in value && 'value' in value && value.typeUrl && value.value) {
              const nested = this.decodeNestedAny(value as Any);
              if (nested) {
                nestedMessages.push({
                  type: nested.type,
                  typeUrl: nested.typeUrl,
                  message: nested.message,
                  fieldName: fieldPath
                });
              }
            } else {
              // Recursively search nested objects
              this.findAnyFields(value, nestedMessages, fieldPath);
            }
          }
        }
      }
  
    /**
     * Convert hex string to Uint8Array
     */
    private static hexToBytes(hex: string): Uint8Array {
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
      }
      return bytes;
    }
  
    /**
     * Get human-readable info from decoded message
     */
    static getMessageInfo(decoded: DecodedIbcMessage): IbcMessageInfo {
      // Extract all nested messages first
      const nestedMessages = this.extractNestedMessages(decoded.message, decoded.type);
      
      switch (decoded.type) {
        case 'MsgRecvPacket':
          const recvMsg = decoded.message as MsgRecvPacket;
          return {
            type: 'Receive Packet',
            description: `Receive packet on port ${recvMsg.packet?.sourcePort} channel ${recvMsg.packet?.sourceChannel}`,
            sequence: recvMsg.packet?.sequence ? Number(recvMsg.packet.sequence) : undefined,
            sourcePort: recvMsg.packet?.sourcePort,
            sourceChannel: recvMsg.packet?.sourceChannel,
            destPort: recvMsg.packet?.destinationPort,
            destChannel: recvMsg.packet?.destinationChannel,
            nestedMessages: nestedMessages,
          };
  
        case 'MsgAcknowledgement':
          const ackMsg = decoded.message as MsgAcknowledgement;
          return {
            type: 'Acknowledgement',
            description: `Acknowledge packet on port ${ackMsg.packet?.sourcePort} channel ${ackMsg.packet?.sourceChannel}`,
            sequence: ackMsg.packet?.sequence ? Number(ackMsg.packet.sequence) : undefined,
            sourcePort: ackMsg.packet?.sourcePort,
            sourceChannel: ackMsg.packet?.sourceChannel,
            destPort: ackMsg.packet?.destinationPort,
            destChannel: ackMsg.packet?.destinationChannel,
            nestedMessages: nestedMessages,
          };
  
        case 'MsgTimeout':
          const timeoutMsg = decoded.message as MsgTimeout;
          return {
            type: 'Timeout',
            description: `Packet timeout on port ${timeoutMsg.packet?.sourcePort} channel ${timeoutMsg.packet?.sourceChannel}`,
            sequence: timeoutMsg.packet?.sequence ? Number(timeoutMsg.packet.sequence) : undefined,
            sourcePort: timeoutMsg.packet?.sourcePort,
            sourceChannel: timeoutMsg.packet?.sourceChannel,
            destPort: timeoutMsg.packet?.destinationPort,
            destChannel: timeoutMsg.packet?.destinationChannel,
            nestedMessages: nestedMessages,
          };

        case 'MsgSendPacket':
           const sendMsg = decoded.message as MsgSendPacket;
           return {
             type: 'Send Packet',
             description: `Send packet from client ${sendMsg.sourceClient}`,
             nestedMessages: nestedMessages,
          };
  
        case 'MsgUpdateClient':
          const updateMsg = decoded.message as MsgUpdateClient;
          let description = `Update IBC client ${updateMsg.clientId}`;
          
          if (nestedMessages.length > 0) {
            description += ` (${nestedMessages.map(n => n.type).join(', ')})`;
          }

          return {
            type: 'Update Client',
            description: description,
            clientId: updateMsg.clientId,
            nestedMessages: nestedMessages,
          };

        case 'MsgCreateClient':
          let createDescription = `Create IBC client`;
          
          if (nestedMessages.length > 0) {
            createDescription += ` (${nestedMessages.map(n => n.type).join(', ')})`;
          }

          return {
            type: 'Create Client',
            description: createDescription,
            nestedMessages: nestedMessages,
          };

        case 'TendermintHeader':
          const headerMsg = decoded.message as any;
          let headerDescription = `Tendermint header update`;
          
          // Extract information from the header
          if (headerMsg.signedHeader) {
            const signedHeader = headerMsg.signedHeader;
            if (signedHeader.header) {
              const header = signedHeader.header;
              if (header.chainId) {
                headerDescription += ` for chain ${header.chainId}`;
              }
              if (header.height) {
                headerDescription += ` at height ${header.height}`;
              }
            }
          }
          
          if (headerMsg.trustedHeight) {
            const trustedHeight = headerMsg.trustedHeight;
            if (trustedHeight.revisionNumber && trustedHeight.revisionHeight) {
              headerDescription += ` (trusted: ${trustedHeight.revisionNumber}-${trustedHeight.revisionHeight})`;
            }
          }
          
          return {
            type: 'Tendermint Header',
            description: headerDescription,
            nestedMessages: nestedMessages,
          };

        case 'TendermintClientState':
          const clientStateMsg = decoded.message as any;
          return {
            type: 'Tendermint Client State',
            description: `Tendermint client state for chain ${clientStateMsg.chainId || 'unknown'}`,
            nestedMessages: nestedMessages,
          };

        case 'TendermintConsensusState':
          return {
            type: 'Tendermint Consensus State',
            description: `Tendermint consensus state update`,
            nestedMessages: nestedMessages,
          };
  
        default:
          return {
            type: decoded.type,
            description: `Unknown IBC message type: ${decoded.type}`,
            nestedMessages: nestedMessages,
          };
      }
    }
  }
  
  // Types
  export interface DecodedIbcMessage {
    type: string;
    message: any; // The decoded protobuf message
    rawBytes: Uint8Array;
    wrappedInAny?: boolean; // Whether the message was wrapped in an Any type
    anyTypeUrl?: string; // The typeUrl of the Any wrapper if applicable
  }

  export interface DecodedNestedMessage {
    type: string;
    message: any;
    typeUrl: string;
  }

  export interface NestedMessageInfo {
    type: string;
    typeUrl: string;
    message: any;
    fieldName: string; // Which field contained this Any
  }
  
  export interface IbcMessageInfo {
    type: string;
    description: string;
    sequence?: number;
    sourcePort?: string;
    sourceChannel?: string;
    destPort?: string;
    destChannel?: string;
    clientId?: string;
    nestedMessages: NestedMessageInfo[]; // Now an array to handle multiple nested messages
  }

  /**
   * IBC Event Decoder - Handles Tendermint events from block results
   * 
   * Events that need proto decoding:
   * - send_packet (packet_data_hex)
   * - recv_packet (packet_data_hex) 
   * - write_acknowledgement (packet_data_hex, packet_ack_hex)
   * - WASM light client events (wasm_checksum, new_checksum)
   * 
   * Events that are plaintext only (commented out):
   * - Connection handshake events (connection_open_init, connection_open_try, etc.)
   * - Channel handshake events (channel_open_init, channel_open_try, etc.)
   * - acknowledge_packet, timeout_packet
   * - Most client events (except header in MsgUpdateClient)
   * 
   * USAGE EXAMPLE:
   * ```typescript
   * import { useBlockResults } from '../queries/useBlockResults';
   * import { IbcEventDecoder } from '../utils/ibc-decoder';
   * 
   * // In your component:
   * const { data: blockResults } = useBlockResults(blockHeight);
   * 
   * // Decode IBC event for a specific transaction
   * const decodedEvent = IbcEventDecoder.decodeIbcEventByTxHash(
   *   txHash, 
   *   blockHeight, 
   *   blockResults
   * );
   * 
   * if (decodedEvent) {
   *   console.log('Event type:', decodedEvent.type);
   *   console.log('Description:', decodedEvent.description);
   *   console.log('Attributes:', decodedEvent.attributes);
   *   console.log('Needs proto decoding:', decodedEvent.needsProtoDecoding);
   *   
   *   // For events with proto decoding, hex fields are replaced with decoded objects
   *   // For example, in update_client events:
   *   if (decodedEvent.attributes.header) {
   *     console.log('Decoded header:', decodedEvent.attributes.header);
   *   }
   *   
   *   // For packet events:
   *   if (decodedEvent.attributes.packet_data_hex) {
   *     console.log('Decoded packet data:', decodedEvent.attributes.packet_data_hex);
   *   }
   * }
   * ```
   */
  export class IbcEventDecoder {


    /**
     * Parse event attributes from Tendermint format
     */
    private static parseAttributes(attributes: any[]): Record<string, string> {
      const parsed: Record<string, string> = {};
      
      if (Array.isArray(attributes)) {
        for (const attr of attributes) {
          if (attr.key && attr.value) {
            // Don't decode base64 - use raw values as they are already decoded
            parsed[attr.key] = attr.value;
          }
        }
      }
      
      return parsed;
    }

    /**
     * Comprehensive IBC Event Decoder - Single method to handle all IBC events
     * 
     * This method takes a transaction hash and block height, finds the corresponding
     * IBC event in the block results, and returns decoded JSON.
     * 
     * For plaintext-only events: returns the event attributes as JSON
     * For events with proto-encoded fields: decodes the hex fields and returns enhanced JSON
     */
    static decodeIbcEventByTxHash(
      txHash: string,
      blockResults: any
    ): DecodedIbcEventJson | null {
      try {
        // Find the IBC event corresponding to this transaction hash
        const ibcEvent = this.findIbcEventByTxHash(txHash, blockResults);
        
        if (!ibcEvent) {
          return null;
        }

        // Parse the event attributes
        const attributes = this.parseAttributes(ibcEvent.attributes);
        
        // Determine if this event needs proto decoding
        const needsProtoDecoding = this.eventNeedsProtoDecoding(ibcEvent.type);
        
        if (needsProtoDecoding) {
          // Handle events with proto-encoded fields
          return this.decodeEventWithProtoFields(ibcEvent.type, attributes);
        } else {
          // Handle plaintext-only events
          return this.decodePlaintextEvent(ibcEvent.type, attributes);
        }
        
      } catch (error) {
        console.error('Error decoding IBC event:', error);
        return null;
      }
    }

    /**
     * Find IBC event by transaction hash in block results
     */
    private static findIbcEventByTxHash(txHash: string, blockResults: any): any | null {
      if (!blockResults?.result?.end_block_events) {
        return null;
      }

      // Search through end_block_events
      for (const event of blockResults.result.end_block_events) {
        if (!event.attributes) continue;

        // Check if this event contains the target hash
        let hasTargetHash = false;
        for (const attr of event.attributes) {
          if (attr.key === 'inner-tx-hash' && attr.value.toLowerCase() === txHash.toLowerCase()) {
            hasTargetHash = true;
            break;
          }
        }

        if (hasTargetHash) {
          // Check if this is an IBC event
          if (this.isIbcEvent(event.type)) {
            return event;
          }
          
          // If this is a 'message' event with IBC module, look for the next IBC event
          if (event.type === 'message') {
            const isIbcModule = event.attributes.some((attr: any) => 
              attr.key === 'module' && attr.value === 'ibc'
            );
            
            if (isIbcModule) {
              // Look for the next event in the sequence that is an IBC event
              const eventIndex = blockResults.result.end_block_events.indexOf(event);
              for (let i = eventIndex + 1; i < blockResults.result.end_block_events.length; i++) {
                const nextEvent = blockResults.result.end_block_events[i];
                if (this.isIbcEvent(nextEvent.type)) {
                  return nextEvent;
                }
              }
            }
          }
        }
      }

      return null;
    }

    /**
     * Check if an event type is an IBC event
     */
    private static isIbcEvent(eventType: string): boolean {
      const ibcEventTypes = [
        // Events with proto decoding
        'send_packet',
        'recv_packet', 
        'write_acknowledgement',
        'update_client',
        'store_wasm_code',
        'migrate_contract',
        'wasm_checksum',
        'new_checksum',
        
        // Plaintext-only events
        'connection_open_init',
        'connection_open_try',
        'connection_open_ack',
        'connection_open_confirm',
        'channel_open_init',
        'channel_open_try',
        'channel_open_ack',
        'channel_open_confirm',
        'channel_close_init',
        'channel_close_confirm',
        'acknowledge_packet',
        'timeout_packet',
        'create_client',
        'upgrade_client',
        'submit_misbehaviour',
        'client_misbehaviour',
        'update_client_proposal',
        'schedule_ibc_software_upgrade',
        'fungible_token_packet',
        'denomination_trace',
        'ibc_transfer',
        'timeout',
        'register_interchain_account',
        'submit_tx',
        'submit_evidence'
      ];

      return ibcEventTypes.includes(eventType);
    }

    /**
     * Determine if an event type needs proto decoding
     */
    private static eventNeedsProtoDecoding(eventType: string): boolean {
      const eventsWithProtoDecoding = [
        // Packet events with hex-encoded proto data
        'send_packet',
        'recv_packet',
        'write_acknowledgement',
        
        // Client events with headers (proto-encoded)
        'update_client',
        
        // WASM light client events with hex-encoded checksums
        'store_wasm_code',
        'migrate_contract',
        'wasm_checksum',
        'new_checksum'
      ];

      return eventsWithProtoDecoding.includes(eventType);
    }

    /**
     * Decode events with proto-encoded fields
     */
    private static decodeEventWithProtoFields(eventType: string, attributes: Record<string, string>): DecodedIbcEventJson {
      // Create a copy of attributes to modify
      const decodedAttributes = { ...attributes };

      try {
        switch (eventType) {
          case 'send_packet':
            return this.decodeSendPacketEvent(decodedAttributes);
            
          case 'recv_packet':
            return this.decodeRecvPacketEvent(decodedAttributes);
            
          case 'write_acknowledgement':
            return this.decodeWriteAcknowledgementEvent(decodedAttributes);
            
          case 'update_client':
            return this.decodeUpdateClientEvent(decodedAttributes);
            
          case 'store_wasm_code':
            return this.decodeStoreWasmCodeEvent(decodedAttributes);
            
          case 'migrate_contract':
            return this.decodeMigrateContractEvent(decodedAttributes);
            
          case 'wasm_checksum':
            return this.decodeWasmChecksumEvent(decodedAttributes);
            
          case 'new_checksum':
            return this.decodeNewChecksumEvent(decodedAttributes);
            
          default:
            return {
              type: eventType,
              description: this.getEventDescription(eventType, decodedAttributes),
              attributes: decodedAttributes,
              needsProtoDecoding: true
            };
        }
      } catch (error) {
        console.warn(`Failed to decode proto fields for ${eventType}:`, error);
        return {
          type: eventType,
          description: this.getEventDescription(eventType, decodedAttributes),
          attributes: decodedAttributes,
          needsProtoDecoding: true
        };
      }
    }

    /**
     * Decode plaintext-only events
     */
    private static decodePlaintextEvent(eventType: string, attributes: Record<string, string>): DecodedIbcEventJson {
      return {
        type: eventType,
        description: this.getEventDescription(eventType, attributes),
        attributes: attributes,
        needsProtoDecoding: false
      };
    }

    /**
     * Get human-readable description for an event
     */
    private static getEventDescription(eventType: string, attributes: Record<string, string>): string {
      switch (eventType) {
        case 'send_packet':
          return `Send packet from ${attributes.source_port || 'unknown'} to ${attributes.destination_port || 'unknown'}`;
          
        case 'recv_packet':
          return `Receive packet on ${attributes.destination_port || 'unknown'} from ${attributes.source_port || 'unknown'}`;
          
        case 'write_acknowledgement':
          return `Write acknowledgement for packet on ${attributes.destination_port || 'unknown'}`;
          
        case 'wasm_checksum':
          return `WASM light client checksum update`;
          
        case 'new_checksum':
          return `WASM light client new checksum`;
          
        case 'connection_open_init':
          return `Connection open init for ${attributes.connection_id || 'unknown'}`;
          
        case 'connection_open_try':
          return `Connection open try for ${attributes.connection_id || 'unknown'}`;
          
        case 'connection_open_ack':
          return `Connection open ack for ${attributes.connection_id || 'unknown'}`;
          
        case 'connection_open_confirm':
          return `Connection open confirm for ${attributes.connection_id || 'unknown'}`;
          
        case 'channel_open_init':
          return `Channel open init on port ${attributes.port_id || 'unknown'}`;
          
        case 'channel_open_try':
          return `Channel open try on port ${attributes.port_id || 'unknown'}`;
          
        case 'channel_open_ack':
          return `Channel open ack on port ${attributes.port_id || 'unknown'}`;
          
        case 'channel_open_confirm':
          return `Channel open confirm on port ${attributes.port_id || 'unknown'}`;
          
        case 'channel_close_init':
          return `Channel close init on port ${attributes.port_id || 'unknown'}`;
          
        case 'channel_close_confirm':
          return `Channel close confirm on port ${attributes.port_id || 'unknown'}`;
          
        case 'acknowledge_packet':
          return `Acknowledge packet on ${attributes.source_port || 'unknown'}`;
          
        case 'timeout_packet':
          return `Timeout packet on ${attributes.source_port || 'unknown'}`;
          
        case 'create_client':
          return `Create client ${attributes.client_id || 'unknown'}`;
          
        case 'update_client':
          return `Update client ${attributes.client_id || 'unknown'}`;
          
        case 'store_wasm_code':
          return `Store WASM code`;
          
        case 'migrate_contract':
          return `Migrate WASM contract`;
          
        case 'upgrade_client':
          return `Upgrade client ${attributes.client_id || 'unknown'}`;
          
        case 'submit_misbehaviour':
        case 'client_misbehaviour':
          return `Client misbehaviour for ${attributes.client_id || 'unknown'}`;
          
        case 'update_client_proposal':
          return `Update client proposal for ${attributes.client_id || 'unknown'}`;
          
        case 'schedule_ibc_software_upgrade':
          return `Schedule IBC software upgrade: ${attributes.title || 'unknown'}`;
          
        case 'fungible_token_packet':
          return `Fungible token packet: ${attributes.amount || '0'} ${attributes.denom || 'unknown'}`;
          
        case 'ibc_transfer':
          return `IBC transfer: ${attributes.amount || '0'} ${attributes.denom || 'unknown'}`;
          
        case 'timeout':
          return `Transfer timeout: refund ${attributes.amount || '0'} ${attributes.denom || 'unknown'}`;
          
        case 'register_interchain_account':
          return `Register interchain account for ${attributes.owner || 'unknown'}`;
          
        case 'submit_tx':
          return `Submit interchain account transaction`;
          
        case 'submit_evidence':
          return `Submit evidence: ${attributes.evidence_hash || 'unknown'}`;
          
        default:
          return `IBC Event: ${eventType}`;
      }
    }

    /**
     * Decode send_packet event with proto fields
     */
    private static decodeSendPacketEvent(attributes: Record<string, any>): DecodedIbcEventJson {
      if (attributes.packet_data_hex) {
        try {
          const packetData = IbcDecoder.decodeHexMessage(attributes.packet_data_hex);
          const packetInfo = IbcDecoder.getMessageInfo(packetData);
          attributes.packet_data_hex = packetInfo; // Replace hex with decoded data
        } catch (error) {
          console.warn('Failed to decode packet_data_hex:', error);
        }
      }
      
      return {
        type: 'send_packet',
        description: this.getEventDescription('send_packet', attributes),
        attributes: attributes,
        needsProtoDecoding: true
      };
    }

    /**
     * Decode recv_packet event with proto fields
     */
    private static decodeRecvPacketEvent(attributes: Record<string, any>): DecodedIbcEventJson {
      if (attributes.packet_data_hex) {
        try {
          const packetData = IbcDecoder.decodeHexMessage(attributes.packet_data_hex);
          const packetInfo = IbcDecoder.getMessageInfo(packetData);
          attributes.packet_data_hex = packetInfo; // Replace hex with decoded data
        } catch (error) {
          console.warn('Failed to decode packet_data_hex:', error);
        }
      }
      
      return {
        type: 'recv_packet',
        description: this.getEventDescription('recv_packet', attributes),
        attributes: attributes,
        needsProtoDecoding: true
      };
    }

    /**
     * Decode write_acknowledgement event with proto fields
     */
    private static decodeWriteAcknowledgementEvent(attributes: Record<string, any>): DecodedIbcEventJson {
      try {
        if (attributes.packet_data_hex) {
          try {
            const decodedPacketData = IbcDecoder.decodeHexMessage(attributes.packet_data_hex);
            attributes.packet_data_hex = IbcDecoder.getMessageInfo(decodedPacketData);
          } catch (error) {
            console.warn('Failed to decode packet_data_hex:', error);
          }
        }
        
        if (attributes.packet_ack_hex) {
          try {
            const decodedPacketAck = IbcDecoder.decodeHexMessage(attributes.packet_ack_hex);
            attributes.packet_ack_hex = IbcDecoder.getMessageInfo(decodedPacketAck);
          } catch (error) {
            console.warn('Failed to decode packet_ack_hex:', error);
          }
        }
      } catch (error) {
        console.warn('Failed to decode write_acknowledgement event:', error);
      }
      
      return {
        type: 'write_acknowledgement',
        description: this.getEventDescription('write_acknowledgement', attributes),
        attributes: attributes,
        needsProtoDecoding: true
      };
    }

    /**
     * Decode wasm_checksum event with proto fields
     */
    private static decodeWasmChecksumEvent(attributes: Record<string, any>): DecodedIbcEventJson {
      if (attributes.wasm_checksum) {
        try {
          const checksumData = IbcDecoder.decodeHexMessage(attributes.wasm_checksum);
          const checksumInfo = IbcDecoder.getMessageInfo(checksumData);
          attributes.wasm_checksum = checksumInfo; // Replace hex with decoded data
        } catch (error) {
          console.warn('Failed to decode wasm_checksum:', error);
        }
      }
      
      return {
        type: 'wasm_checksum',
        description: this.getEventDescription('wasm_checksum', attributes),
        attributes: attributes,
        needsProtoDecoding: true
      };
    }

    /**
     * Decode update_client event with proto fields (headers)
     */
    private static decodeUpdateClientEvent(attributes: Record<string, any>): DecodedIbcEventJson {
      // Decode header if present
      if (attributes.header) {
        try {
          const headerData = IbcDecoder.decodeHexMessage(attributes.header);
          // Store the actual decoded header data, not just the message info
          attributes.header = {
            decodedMessage: headerData.message,
            messageInfo: IbcDecoder.getMessageInfo(headerData),
            type: headerData.type,
            wrappedInAny: headerData.wrappedInAny,
            anyTypeUrl: headerData.anyTypeUrl
          };
        } catch (error) {
          console.warn('Failed to decode header in update_client:', error);
        }
      } else {
        // No header field found in update_client event
      }
      
      return {
        type: 'update_client',
        description: this.getEventDescription('update_client', attributes),
        attributes: attributes,
        needsProtoDecoding: true
      };
    }

    /**
     * Decode store_wasm_code event with proto fields
     */
    private static decodeStoreWasmCodeEvent(attributes: Record<string, any>): DecodedIbcEventJson {
      if (attributes.wasm_checksum) {
        try {
          const checksumData = IbcDecoder.decodeHexMessage(attributes.wasm_checksum);
          const checksumInfo = IbcDecoder.getMessageInfo(checksumData);
          attributes.wasm_checksum = checksumInfo; // Replace hex with decoded data
        } catch (error) {
          console.warn('Failed to decode wasm_checksum in store_wasm_code:', error);
        }
      }
      
      return {
        type: 'store_wasm_code',
        description: this.getEventDescription('store_wasm_code', attributes),
        attributes: attributes,
        needsProtoDecoding: true
      };
    }

    /**
     * Decode migrate_contract event with proto fields
     */
    private static decodeMigrateContractEvent(attributes: Record<string, any>): DecodedIbcEventJson {
      try {
        if (attributes.wasm_checksum) {
          try {
            const checksumData = IbcDecoder.decodeHexMessage(attributes.wasm_checksum);
            attributes.wasm_checksum = IbcDecoder.getMessageInfo(checksumData);
          } catch (error) {
            console.warn('Failed to decode wasm_checksum in migrate_contract:', error);
          }
        }
        
        if (attributes.new_checksum) {
          try {
            const checksumData = IbcDecoder.decodeHexMessage(attributes.new_checksum);
            attributes.new_checksum = IbcDecoder.getMessageInfo(checksumData);
          } catch (error) {
            console.warn('Failed to decode new_checksum in migrate_contract:', error);
          }
        }
      } catch (error) {
        console.warn('Failed to decode migrate_contract event:', error);
      }
      
      return {
        type: 'migrate_contract',
        description: this.getEventDescription('migrate_contract', attributes),
        attributes: attributes,
        needsProtoDecoding: true
      };
    }

    /**
     * Decode new_checksum event with proto fields
     */
    private static decodeNewChecksumEvent(attributes: Record<string, any>): DecodedIbcEventJson {
      if (attributes.new_checksum) {
        try {
          const checksumData = IbcDecoder.decodeHexMessage(attributes.new_checksum);
          const checksumInfo = IbcDecoder.getMessageInfo(checksumData);
          attributes.new_checksum = checksumInfo; // Replace hex with decoded data
        } catch (error) {
          console.warn('Failed to decode new_checksum:', error);
        }
      }
      
      return {
        type: 'new_checksum',
        description: this.getEventDescription('new_checksum', attributes),
        attributes: attributes,
        needsProtoDecoding: true
      };
    }
  }

  // Event-related types
  export interface DecodedIbcEventJson {
    type: string;
    description: string;
    attributes: Record<string, any>; // Changed from string to any to allow decoded objects
    needsProtoDecoding: boolean;
  }
