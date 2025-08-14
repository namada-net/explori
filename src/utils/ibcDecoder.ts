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
} from '../ibc-proto/ibc/core/client/v1/tx';
import {
  Header as TendermintHeader,
  ClientState as TendermintClientState,
  ConsensusState as TendermintConsensusState,
} from '../ibc-proto/ibc/lightclients/tendermint/v1/tendermint';
import {
  Any,
} from '../ibc-proto/google/protobuf/any';

// Common interfaces
interface IbcPacket {
  sequence: string;
  sourcePort: string;
  sourceChannel: string;
  destPort: string;
  destChannel: string;
  data: Uint8Array;
  timeoutHeight?: TimeoutHeight;
  timeoutTimestamp?: TimeoutTimestamp;
}

interface TimeoutHeight {
  type: 'never' | 'at';
  revisionNumber?: number;
  revisionHeight?: number;
}

interface TimeoutTimestamp {
  type: 'never' | 'at';
  nanoseconds?: bigint;
}

interface ProtobufAny {
  typeUrl: string;
  value: Uint8Array;
  decodedMessage?: any; // The actual decoded protobuf message
  decodedType?: string; // Human-readable type name
  isDecoded?: boolean; // Whether decoding was successful
}

interface DecodedNestedMessage {
  type: string;
  message: any;
  typeUrl: string;
}

// Connection message interfaces
interface IbcConnectionCounterparty {
  clientId: string;
  connectionId: string | null;
  prefix: Uint8Array; // CommitmentPrefix
}

interface IbcConnectionVersion {
  identifier: string;
  features: string[];
}

interface IbcConnectionOpenInitMessage {
  type: 'connection_open_init';
  clientIdOnA: string;
  counterparty: IbcConnectionCounterparty;
  version: IbcConnectionVersion | null;
  delayPeriodNanos: bigint;
  signer: string;
}

interface IbcConnectionOpenTryMessage {
  type: 'connection_open_try';
  clientIdOnB: string;
  clientStateOnA: ProtobufAny;
  counterparty: IbcConnectionCounterparty;
  delayPeriodNanos: bigint;
  counterpartyVersions: IbcConnectionVersion[];
  proofInit: Uint8Array;
  proofClient: Uint8Array;
  proofConsensus: Uint8Array;
  consensusHeightOnA: IbcHeight;
  signer: string;
}

interface IbcConnectionOpenAckMessage {
  type: 'connection_open_ack';
  connectionIdOnA: string;
  connectionIdOnB: string;
  clientStateOnB: ProtobufAny;
  proofTry: Uint8Array;
  proofClient: Uint8Array;
  proofConsensus: Uint8Array;
  consensusHeightOnB: IbcHeight;
  version: IbcConnectionVersion;
  signer: string;
}

interface IbcConnectionOpenConfirmMessage {
  type: 'connection_open_confirm';
  connectionIdOnB: string;
  proofAck: Uint8Array;
  proofHeightOnA: IbcHeight;
  signer: string;
}

// Channel message interfaces
interface IbcHeight {
  revisionNumber: number;
  revisionHeight: number;
}

interface IbcChannelOpenInitMessage {
  type: 'channel_open_init';
  portIdOnA: string;
  connectionHopsOnA: string[];
  portIdOnB: string;
  ordering: 'none' | 'unordered' | 'ordered';
  versionProposal: string;
  signer: string;
}

interface IbcChannelOpenTryMessage {
  type: 'channel_open_try';
  portIdOnB: string;
  connectionHopsOnB: string[];
  portIdOnA: string;
  channelIdOnA: string;
  ordering: 'none' | 'unordered' | 'ordered';
  versionProposal: string;
  counterpartyVersion: string;
  proofInit: Uint8Array;
  proofHeightOnA: IbcHeight;
  signer: string;
}

interface IbcChannelOpenAckMessage {
  type: 'channel_open_ack';
  portIdOnA: string;
  channelIdOnA: string;
  channelIdOnB: string;
  counterpartyVersion: string;
  proofTry: Uint8Array;
  proofHeightOnB: IbcHeight;
  signer: string;
}

interface IbcChannelOpenConfirmMessage {
  type: 'channel_open_confirm';
  portIdOnB: string;
  channelIdOnB: string;
  proofAck: Uint8Array;
  proofHeightOnA: IbcHeight;
  signer: string;
}

interface IbcChannelCloseInitMessage {
  type: 'channel_close_init';
  portIdOnA: string;
  channelIdOnA: string;
  signer: string;
}

interface IbcChannelCloseConfirmMessage {
  type: 'channel_close_confirm';
  portIdOnB: string;
  channelIdOnB: string;
  proofInit: Uint8Array;
  proofHeightOnA: IbcHeight;
  signer: string;
}

// Client message interfaces
interface IbcCreateClientMessage {
  type: 'create_client';
  clientState: ProtobufAny;
  consensusState: ProtobufAny;
  signer: string;
}

interface IbcUpdateClientMessage {
  type: 'update_client';
  clientId: string;
  clientMessage: ProtobufAny;
  signer: string;
}

interface IbcUpgradeClientMessage {
  type: 'upgrade_client';
  clientId: string;
  upgradedClientState: ProtobufAny;
  upgradedConsensusState: ProtobufAny;
  proofUpgradeClient: Uint8Array;
  proofUpgradeConsensusState: Uint8Array;
  signer: string;
}

interface IbcSubmitMisbehaviourMessage {
  type: 'submit_misbehaviour';
  clientId: string;
  misbehaviour: ProtobufAny;
  signer: string;
}

interface IbcRecoverClientMessage {
  type: 'recover_client';
  subjectClientId: string;
  substituteClientId: string;
  signer: string;
}

// Packet message interfaces
interface IbcAckMessage {
  type: 'ack';
  packet: IbcPacket;
  acknowledgement: any; // JSON object or string if JSON parsing fails (corresponds to Acknowledgement in Rust)
  proofAckedOnB: Uint8Array; // CommitmentProofBytes
  proofHeightOnB: IbcHeight; // Height
  signer: string;
}

interface IbcTimeoutMessage {
  type: 'timeout';
  packet: IbcPacket;
  nextSeqRecvOnB: string; // Sequence (u64)
  proofUnreceivedOnB: Uint8Array; // CommitmentProofBytes
  proofHeightOnB: IbcHeight; // Height
  signer: string;
}

interface IbcTimeoutOnCloseMessage {
  type: 'timeout_on_close';
  packet: IbcPacket;
  nextSeqRecvOnB: string; // Sequence (u64)
  proofUnreceivedOnB: Uint8Array; // CommitmentProofBytes
  proofCloseOnB: Uint8Array; // CommitmentProofBytes
  proofHeightOnB: IbcHeight; // Height
  signer: string;
}

interface IbcRecvMessage {
  type: 'recv';
  packet: IbcPacket;
  proofCommitmentOnA: Uint8Array; // CommitmentProofBytes
  proofHeightOnA: IbcHeight; // Height
  signer: string;
}

type DecodedIbcMessage =
  | IbcCreateClientMessage
  | IbcUpdateClientMessage
  | IbcUpgradeClientMessage
  | IbcSubmitMisbehaviourMessage
  | IbcRecoverClientMessage
  | IbcConnectionOpenInitMessage
  | IbcConnectionOpenTryMessage
  | IbcConnectionOpenAckMessage
  | IbcConnectionOpenConfirmMessage
  | IbcChannelOpenInitMessage
  | IbcChannelOpenTryMessage
  | IbcChannelOpenAckMessage
  | IbcChannelOpenConfirmMessage
  | IbcChannelCloseInitMessage
  | IbcChannelCloseConfirmMessage
  | IbcAckMessage
  | IbcTimeoutMessage
  | IbcTimeoutOnCloseMessage
  | IbcRecvMessage;

interface IbcDisplayEvent {
  name: string;
  description: string;
  message: DecodedIbcMessage;
}

export class IbcDecoder {

  /**
   * Convert BigInt values to strings and format Uint8Arrays compactly
   */
  private static serializeBigInts(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    if (typeof obj === 'bigint') {
      return obj.toString();
    }
    
    if (obj instanceof Uint8Array) {
      return this.formatUint8Array(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.serializeBigInts(item));
    }
    
    if (typeof obj === 'object') {
      const serialized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        serialized[key] = this.serializeBigInts(value);
      }
      return serialized;
    }
    
    return obj;
  }

  /**
   * Format Uint8Array in a compact, truncated form
   */
  private static formatUint8Array(arr: Uint8Array): string {
    if (arr.length === 0) {
      return "[]";
    }
    
    if (arr.length <= 8) {
      // If small enough, show all elements
      return `[${Array.from(arr).join(', ')}]`;
    }
    
    // For larger arrays, show first 4 and last 4 elements
    const first4 = Array.from(arr.slice(0, 4)).join(', ');
    const last4 = Array.from(arr.slice(-4)).join(', ');
    return `[${first4} ... ${last4}] (${arr.length} bytes)`;
  }

  // MsgEnvelope discriminants
  private static readonly MSG_ENVELOPE_CLIENT = 0;   // MsgEnvelope::Client
  private static readonly MSG_ENVELOPE_CONNECTION = 1; // MsgEnvelope::Connection  
  private static readonly MSG_ENVELOPE_CHANNEL = 2;   // MsgEnvelope::Channel
  private static readonly MSG_ENVELOPE_PACKET = 3;    // MsgEnvelope::Packet

  // ClientMsg discriminants
  private static readonly CLIENT_MSG_CREATE = 0;     // ClientMsg::CreateClient
  private static readonly CLIENT_MSG_UPDATE = 1;     // ClientMsg::UpdateClient
  private static readonly CLIENT_MSG_MISBEHAVIOUR = 2; // ClientMsg::Misbehaviour
  private static readonly CLIENT_MSG_UPGRADE = 3;    // ClientMsg::UpgradeClient
  private static readonly CLIENT_MSG_RECOVER = 4;    // ClientMsg::RecoverClient

  // ConnectionMsg discriminants
  private static readonly CONNECTION_MSG_OPEN_INIT = 0;    // ConnectionMsg::OpenInit
  private static readonly CONNECTION_MSG_OPEN_TRY = 1;     // ConnectionMsg::OpenTry
  private static readonly CONNECTION_MSG_OPEN_ACK = 2;     // ConnectionMsg::OpenAck
  private static readonly CONNECTION_MSG_OPEN_CONFIRM = 3; // ConnectionMsg::OpenConfirm

  // ChannelMsg discriminants
  private static readonly CHANNEL_MSG_OPEN_INIT = 0;       // ChannelMsg::OpenInit
  private static readonly CHANNEL_MSG_OPEN_TRY = 1;        // ChannelMsg::OpenTry
  private static readonly CHANNEL_MSG_OPEN_ACK = 2;        // ChannelMsg::OpenAck
  private static readonly CHANNEL_MSG_OPEN_CONFIRM = 3;    // ChannelMsg::OpenConfirm
  private static readonly CHANNEL_MSG_CLOSE_INIT = 4;      // ChannelMsg::CloseInit
  private static readonly CHANNEL_MSG_CLOSE_CONFIRM = 5;   // ChannelMsg::CloseConfirm

  // PacketMsg discriminants
  private static readonly PACKET_MSG_RECV = 0;       // PacketMsg::Recv
  private static readonly PACKET_MSG_ACK = 1;        // PacketMsg::Ack
  private static readonly PACKET_MSG_TIMEOUT = 2;    // PacketMsg::Timeout
  private static readonly PACKET_MSG_TIMEOUT_ON_CLOSE = 3; // PacketMsg::TimeoutOnClose 

  // TimeoutHeight discriminants (Borsh enum)
  private static readonly TIMEOUT_HEIGHT_NEVER = 0;  // TimeoutHeight::Never
  private static readonly TIMEOUT_HEIGHT_AT = 1;     // TimeoutHeight::At

  // TimeoutTimestamp discriminants (Borsh enum)
  private static readonly TIMEOUT_TIMESTAMP_NEVER = 0; // TimeoutTimestamp::Never
  private static readonly TIMEOUT_TIMESTAMP_AT = 1;    // TimeoutTimestamp::At

  // Channel Order discriminants (Borsh enum)
  private static readonly CHANNEL_ORDER_NONE = 0;      // Order::None
  private static readonly CHANNEL_ORDER_UNORDERED = 1; // Order::Unordered
  private static readonly CHANNEL_ORDER_ORDERED = 2;   // Order::Ordered


  static decodeIbcMessage(hexData: string): DecodedIbcMessage | null {
    try {
      const cleanHex = hexData.startsWith('0x') ? hexData.slice(2) : hexData;
      const bytes = this.hexToBytes(cleanHex);

      if (bytes.length < 2) {
        console.log('Not enough bytes for message type');
        return null;
      }

      // First byte: MsgEnvelope discriminant
      const envelopeDiscriminant = bytes[0];
      // Second byte: Specific message discriminant  
      const messageDiscriminant = bytes[1];

      // Start content parsing at offset 2
      const contentOffset = 2;

      let decodedMessage: DecodedIbcMessage | null = null;

      switch (envelopeDiscriminant) {
        case this.MSG_ENVELOPE_CLIENT:
          decodedMessage = this.decodeClientMessage(messageDiscriminant, bytes, contentOffset);
          break;
        case this.MSG_ENVELOPE_CONNECTION:
          decodedMessage = this.decodeConnectionMessage(messageDiscriminant, bytes, contentOffset);
          break;
        case this.MSG_ENVELOPE_CHANNEL:
          decodedMessage = this.decodeChannelMessage(messageDiscriminant, bytes, contentOffset);
          break;
        case this.MSG_ENVELOPE_PACKET:
          decodedMessage = this.decodePacketMessage(messageDiscriminant, bytes, contentOffset);
          break;
        default:
          console.log(`Unknown envelope discriminant: ${envelopeDiscriminant}`);
          return null;
      }

      // Serialize BigInt values before returning
      return decodedMessage ? this.serializeBigInts(decodedMessage) : null;
    } catch (error) {
      console.error('Failed to decode IBC message:', error);
      return null;
    }
  }

  /**
   * Decode IBC message and return with display information
   */
  static decodeIbcDisplayEvent(hexData: string): IbcDisplayEvent | null {
    const decodedMessage = this.decodeIbcMessage(hexData);
    if (!decodedMessage) {
      return null;
    }

    const displayInfo = this.generateDisplayInfo(decodedMessage);
    return {
      name: displayInfo.name,
      description: displayInfo.description,
      message: decodedMessage
    };
  }

  /**
   * Generate human-readable name and description for decoded IBC messages
   */
  private static generateDisplayInfo(message: DecodedIbcMessage): { name: string; description: string } {
    switch (message.type) {
      // Client messages
      case 'create_client':
        return {
          name: 'IBC Create Client',
          description: `Create new IBC client for ${message.clientState?.decodedMessage?.chainId ?? "unknown"}`
        };

      case 'update_client':
        // Try to extract chain ID from the decoded client message
        let chainId = '';
        try {
          if (message.clientMessage?.decodedMessage?.signedHeader?.header?.chainId) {
            chainId = ` for ${message.clientMessage.decodedMessage.signedHeader.header.chainId}`;
          }
        } catch (error) {
          // If we can't extract chain ID, just continue without it
        }
        
        return {
          name: 'IBC Update Client',
          description: `Update client ${message.clientId}${chainId}`
        };

      case 'upgrade_client':
        return {
          name: 'IBC Upgrade Client',
          description: `Upgrade client ${message.clientId}`
        };

      case 'submit_misbehaviour':
        return {
          name: 'IBC Submit Misbehaviour',
          description: `Submit misbehaviour evidence for client ${message.clientId}`
        };

      case 'recover_client':
        return {
          name: 'IBC Recover Client',
          description: `Recover client ${message.subjectClientId} using substitute ${message.substituteClientId}`
        };

      // Connection messages
      case 'connection_open_init':
        return {
          name: 'IBC Connection Open Init',
          description: `Initialize connection with client ${message.clientIdOnA}`
        };

      case 'connection_open_try':
        return {
          name: 'IBC Connection Open Try',
          description: `Try to open connection with client ${message.clientIdOnB}`
        };

      case 'connection_open_ack':
        return {
          name: 'IBC Connection Open Ack',
          description: `Acknowledge connection ${message.connectionIdOnA} ↔ ${message.connectionIdOnB}`
        };

      case 'connection_open_confirm':
        return {
          name: 'IBC Connection Open Confirm',
          description: `Confirm connection ${message.connectionIdOnB}`
        };

      // Channel messages
      case 'channel_open_init':
        return {
          name: 'IBC Channel Open Init',
          description: `Initialize channel ${message.portIdOnA} ↔ ${message.portIdOnB}`
        };

      case 'channel_open_try':
        return {
          name: 'IBC Channel Open Try',
          description: `Try to open channel ${message.portIdOnB}/${message.channelIdOnA}`
        };

      case 'channel_open_ack':
        return {
          name: 'IBC Channel Open Ack',
          description: `Acknowledge channel ${message.portIdOnA}/${message.channelIdOnA} ↔ ${message.channelIdOnB}`
        };

      case 'channel_open_confirm':
        return {
          name: 'IBC Channel Open Confirm',
          description: `Confirm channel ${message.portIdOnB}/${message.channelIdOnB}`
        };

      case 'channel_close_init':
        return {
          name: 'IBC Channel Close Init',
          description: `Initialize closing of channel ${message.portIdOnA}/${message.channelIdOnA}`
        };

      case 'channel_close_confirm':
        return {
          name: 'IBC Channel Close Confirm',
          description: `Confirm closing of channel ${message.portIdOnB}/${message.channelIdOnB}`
        };

      // Packet messages
      case 'recv':
        return {
          name: 'IBC Receive Packet',
          description: `Receive packet #${message.packet.sequence} on ${message.packet.destPort}/${message.packet.destChannel}`
        };

      case 'ack':
        return {
          name: 'IBC Acknowledge Packet',
          description: `Acknowledge packet #${message.packet.sequence} from ${message.packet.sourcePort}/${message.packet.sourceChannel}`
        };

      case 'timeout':
        return {
          name: 'IBC Timeout Packet',
          description: `Timeout packet #${message.packet.sequence} from ${message.packet.sourcePort}/${message.packet.sourceChannel}`
        };

      case 'timeout_on_close':
        return {
          name: 'IBC Timeout On Close',
          description: `Timeout packet #${message.packet.sequence} due to channel close`
        };

      default:
        return {
          name: 'Unknown IBC Message',
          description: `Unknown IBC message type: ${(message as any).type}`
        };
    }
  }

  /**
   * Decode client messages
   */
  private static decodeClientMessage(messageDescriminant: number, bytes: Uint8Array, contentOffset: number): DecodedIbcMessage | null {
    try {
      switch (messageDescriminant) {
        case this.CLIENT_MSG_CREATE:
          return this.decodeCreateClientMessage(bytes, contentOffset);
        case this.CLIENT_MSG_UPDATE:
          return this.decodeUpdateClientMessage(bytes, contentOffset);
        case this.CLIENT_MSG_UPGRADE:
          return this.decodeUpgradeClientMessage(bytes, contentOffset);
        case this.CLIENT_MSG_MISBEHAVIOUR:
          return this.decodeMisbehaviourMessage(bytes, contentOffset);
        case this.CLIENT_MSG_RECOVER:
          return this.decodeRecoverClientMessage(bytes, contentOffset);
        default:
          return null;
      }
    } catch (error) {
      console.error('Failed to decode client message:', error);
      return null;
    }
  }

  /**
   * Decode connection messages
   */
  private static decodeConnectionMessage(messageDescriminant: number, bytes: Uint8Array, contentOffset: number): DecodedIbcMessage | null {
    try {
      switch (messageDescriminant) {
        case this.CONNECTION_MSG_OPEN_INIT:
          return this.decodeConnectionOpenInitMessage(bytes, contentOffset);
        case this.CONNECTION_MSG_OPEN_TRY:
          return this.decodeConnectionOpenTryMessage(bytes, contentOffset);
        case this.CONNECTION_MSG_OPEN_ACK:
          return this.decodeConnectionOpenAckMessage(bytes, contentOffset);
        case this.CONNECTION_MSG_OPEN_CONFIRM:
          return this.decodeConnectionOpenConfirmMessage(bytes, contentOffset);
        default:
          console.log(`Unknown connection message discriminant: ${messageDescriminant}`);
          return null;
      }
    } catch (error) {
      console.error('Failed to decode connection message:', error);
      return null;
    }
  }

  /**
   * Decode channel messages
   */
  private static decodeChannelMessage(messageDescriminant: number, bytes: Uint8Array, contentOffset: number): DecodedIbcMessage | null {
    try {
      switch (messageDescriminant) {
        case this.CHANNEL_MSG_OPEN_INIT:
          return this.decodeChannelOpenInitMessage(bytes, contentOffset);
        case this.CHANNEL_MSG_OPEN_TRY:
          return this.decodeChannelOpenTryMessage(bytes, contentOffset);
        case this.CHANNEL_MSG_OPEN_ACK:
          return this.decodeChannelOpenAckMessage(bytes, contentOffset);
        case this.CHANNEL_MSG_OPEN_CONFIRM:
          return this.decodeChannelOpenConfirmMessage(bytes, contentOffset);
        case this.CHANNEL_MSG_CLOSE_INIT:
          return this.decodeChannelCloseInitMessage(bytes, contentOffset);
        case this.CHANNEL_MSG_CLOSE_CONFIRM:
          return this.decodeChannelCloseConfirmMessage(bytes, contentOffset);
        default:
          console.log(`Unknown channel message discriminant: ${messageDescriminant}`);
          return null;
      }
    } catch (error) {
      console.error('Failed to decode channel message:', error);
      return null;
    }
  }

  /**
   * Decode packet messages
   */
  private static decodePacketMessage(messageDescriminant: number, bytes: Uint8Array, contentOffset: number): DecodedIbcMessage | null {
    try {
      switch (messageDescriminant) {
        case this.PACKET_MSG_ACK:
          return this.decodeAckMessage(bytes, contentOffset);
        case this.PACKET_MSG_TIMEOUT:
          return this.decodeTimeoutMessage(bytes, contentOffset);
        case this.PACKET_MSG_TIMEOUT_ON_CLOSE:
          return this.decodeTimeoutOnCloseMessage(bytes, contentOffset);
        case this.PACKET_MSG_RECV:
          return this.decodeRecvMessage(bytes, contentOffset);
        default:
          return null;
      }
    } catch (error) {
      console.error('Failed to decode packet message:', error);
      return null;
    }
  }

  /**
   * Decode CreateClient message
   */
  private static decodeCreateClientMessage(bytes: Uint8Array, offset: number): IbcCreateClientMessage | null {
    try {
      const clientState = this.decodeProtobufAny(bytes, offset);
      offset += this.getProtobufAnySize(clientState);

      const consensusState = this.decodeProtobufAny(bytes, offset);
      offset += this.getProtobufAnySize(consensusState);

      const signer = this.readString(bytes, offset);

      return {
        type: 'create_client',
        clientState,
        consensusState,
        signer
      };
    } catch (error) {
      console.error('Failed to decode CreateClient message:', error);
      return null;
    }
  }

  /**
   * Decode UpdateClient message
   */
  private static decodeUpdateClientMessage(bytes: Uint8Array, offset: number): IbcUpdateClientMessage | null {
    try {
      const clientId = this.readString(bytes, offset);
      offset += 4 + clientId.length;

      const clientMessage = this.decodeProtobufAny(bytes, offset);
      offset += this.getProtobufAnySize(clientMessage);

      const signer = this.readString(bytes, offset);

      return {
        type: 'update_client',
        clientId,
        clientMessage,
        signer
      };
    } catch (error) {
      console.error('Failed to decode UpdateClient message:', error);
      return null;
    }
  }

  /**
   * Decode UpgradeClient message
   */
  private static decodeUpgradeClientMessage(bytes: Uint8Array, offset: number): IbcUpgradeClientMessage | null {
    try {
      const clientId = this.readString(bytes, offset);
      offset += 4 + clientId.length;

      const upgradedClientState = this.decodeProtobufAny(bytes, offset);
      offset += this.getProtobufAnySize(upgradedClientState);

      const upgradedConsensusState = this.decodeProtobufAny(bytes, offset);
      offset += this.getProtobufAnySize(upgradedConsensusState);

      const proofUpgradeClient = this.readBytes(bytes, offset);
      offset += 4 + proofUpgradeClient.length;

      const proofUpgradeConsensusState = this.readBytes(bytes, offset);
      offset += 4 + proofUpgradeConsensusState.length;

      const signer = this.readString(bytes, offset);

      return {
        type: 'upgrade_client',
        clientId,
        upgradedClientState,
        upgradedConsensusState,
        proofUpgradeClient,
        proofUpgradeConsensusState,
        signer
      };
    } catch (error) {
      console.error('Failed to decode UpgradeClient message:', error);
      return null;
    }
  }

  /**
   * Decode Misbehaviour message
   */
  private static decodeMisbehaviourMessage(bytes: Uint8Array, offset: number): IbcSubmitMisbehaviourMessage | null {
    try {
      const clientId = this.readString(bytes, offset);
      offset += 4 + clientId.length;

      const misbehaviour = this.decodeProtobufAny(bytes, offset);
      offset += this.getProtobufAnySize(misbehaviour);

      const signer = this.readString(bytes, offset);

      return {
        type: 'submit_misbehaviour',
        clientId,
        misbehaviour,
        signer
      };
    } catch (error) {
      console.error('Failed to decode Misbehaviour message:', error);
      return null;
    }
  }

  /**
   * Decode RecoverClient message
   */
  private static decodeRecoverClientMessage(bytes: Uint8Array, offset: number): IbcRecoverClientMessage | null {
    try {
      const subjectClientId = this.readString(bytes, offset);
      offset += 4 + subjectClientId.length;

      const substituteClientId = this.readString(bytes, offset);
      offset += 4 + substituteClientId.length;

      const signer = this.readString(bytes, offset);

      return {
        type: 'recover_client',
        subjectClientId,
        substituteClientId,
        signer
      };
    } catch (error) {
      console.error('Failed to decode RecoverClient message:', error);
      return null;
    }
  }

  /**
   * Decode ConnectionOpenInit message
   */
  private static decodeConnectionOpenInitMessage(bytes: Uint8Array, offset: number): IbcConnectionOpenInitMessage | null {
    try {
      const clientIdOnA = this.readString(bytes, offset);
      offset += 4 + clientIdOnA.length;

      const counterparty = this.decodeConnectionCounterparty(bytes, offset);
      offset += this.getConnectionCounterpartySize(counterparty);

      const version = this.decodeOptionalConnectionVersion(bytes, offset);
      offset += this.getOptionalConnectionVersionSize(version);

      const delayPeriodNanos = this.readU64(bytes, offset);
      offset += 8;

      const signer = this.readString(bytes, offset);

      return {
        type: 'connection_open_init',
        clientIdOnA,
        counterparty,
        version,
        delayPeriodNanos,
        signer
      };
    } catch (error) {
      console.error('Failed to decode ConnectionOpenInit message:', error);
      return null;
    }
  }

  /**
   * Decode ConnectionOpenTry message
   */
  private static decodeConnectionOpenTryMessage(bytes: Uint8Array, offset: number): IbcConnectionOpenTryMessage | null {
    try {
      const clientIdOnB = this.readString(bytes, offset);
      offset += 4 + clientIdOnB.length;

      const clientStateOnA = this.decodeProtobufAny(bytes, offset);
      offset += this.getProtobufAnySize(clientStateOnA);

      const counterparty = this.decodeConnectionCounterparty(bytes, offset);
      offset += this.getConnectionCounterpartySize(counterparty);

      const delayPeriodNanos = this.readU64(bytes, offset);
      offset += 8;

      const counterpartyVersions = this.decodeConnectionVersions(bytes, offset);
      offset += this.getConnectionVersionsSize(counterpartyVersions);

      const proofInit = this.readBytes(bytes, offset);
      offset += 4 + proofInit.length;

      const proofClient = this.readBytes(bytes, offset);
      offset += 4 + proofClient.length;

      const proofConsensus = this.readBytes(bytes, offset);
      offset += 4 + proofConsensus.length;

      const consensusHeightOnA = this.decodeHeight(bytes, offset);
      offset += this.getHeightSize(consensusHeightOnA);

      const signer = this.readString(bytes, offset);

      return {
        type: 'connection_open_try',
        clientIdOnB,
        clientStateOnA,
        counterparty,
        delayPeriodNanos,
        counterpartyVersions,
        proofInit,
        proofClient,
        proofConsensus,
        consensusHeightOnA,
        signer
      };
    } catch (error) {
      console.error('Failed to decode ConnectionOpenTry message:', error);
      return null;
    }
  }

  /**
   * Decode ConnectionOpenAck message
   */
  private static decodeConnectionOpenAckMessage(bytes: Uint8Array, offset: number): IbcConnectionOpenAckMessage | null {
    try {
      const connectionIdOnA = this.readString(bytes, offset);
      offset += 4 + connectionIdOnA.length;

      const connectionIdOnB = this.readString(bytes, offset);
      offset += 4 + connectionIdOnB.length;

      const clientStateOnB = this.decodeProtobufAny(bytes, offset);
      offset += this.getProtobufAnySize(clientStateOnB);

      const proofTry = this.readBytes(bytes, offset);
      offset += 4 + proofTry.length;

      const proofClient = this.readBytes(bytes, offset);
      offset += 4 + proofClient.length;

      const proofConsensus = this.readBytes(bytes, offset);
      offset += 4 + proofConsensus.length;

      const consensusHeightOnB = this.decodeHeight(bytes, offset);
      offset += this.getHeightSize(consensusHeightOnB);

      const version = this.decodeConnectionVersion(bytes, offset);
      offset += this.getConnectionVersionSize(version);

      const signer = this.readString(bytes, offset);

      return {
        type: 'connection_open_ack',
        connectionIdOnA,
        connectionIdOnB,
        clientStateOnB,
        proofTry,
        proofClient,
        proofConsensus,
        consensusHeightOnB,
        version,
        signer
      };
    } catch (error) {
      console.error('Failed to decode ConnectionOpenAck message:', error);
      return null;
    }
  }

  /**
   * Decode ConnectionOpenConfirm message
   */
  private static decodeConnectionOpenConfirmMessage(bytes: Uint8Array, offset: number): IbcConnectionOpenConfirmMessage | null {
    try {
      const connectionIdOnB = this.readString(bytes, offset);
      offset += 4 + connectionIdOnB.length;

      const proofAck = this.readBytes(bytes, offset);
      offset += 4 + proofAck.length;

      const proofHeightOnA = this.decodeHeight(bytes, offset);
      offset += this.getHeightSize(proofHeightOnA);

      const signer = this.readString(bytes, offset);

      return {
        type: 'connection_open_confirm',
        connectionIdOnB,
        proofAck,
        proofHeightOnA,
        signer
      };
    } catch (error) {
      console.error('Failed to decode ConnectionOpenConfirm message:', error);
      return null;
    }
  }

  /**
   * Decode ChannelOpenInit message
   */
  private static decodeChannelOpenInitMessage(bytes: Uint8Array, offset: number): IbcChannelOpenInitMessage | null {
    try {
      const portIdOnA = this.readString(bytes, offset);
      offset += 4 + portIdOnA.length;

      const connectionHopsOnA = this.readStrings(bytes, offset);
      offset += this.getStringsSize(connectionHopsOnA);

      const portIdOnB = this.readString(bytes, offset);
      offset += 4 + portIdOnB.length;

      const ordering = this.decodeChannelOrder(bytes, offset);
      offset += this.getChannelOrderSize(ordering);

      const versionProposal = this.readString(bytes, offset);
      offset += 4 + versionProposal.length;

      const signer = this.readString(bytes, offset);

      return {
        type: 'channel_open_init',
        portIdOnA,
        connectionHopsOnA,
        portIdOnB,
        ordering,
        versionProposal,
        signer
      };
    } catch (error) {
      console.error('Failed to decode ChannelOpenInit message:', error);
      return null;
    }
  }

  /**
   * Decode ChannelOpenTry message
   */
  private static decodeChannelOpenTryMessage(bytes: Uint8Array, offset: number): IbcChannelOpenTryMessage | null {
    try {
      const portIdOnB = this.readString(bytes, offset);
      offset += 4 + portIdOnB.length;

      const connectionHopsOnB = this.readStrings(bytes, offset);
      offset += this.getStringsSize(connectionHopsOnB);

      const portIdOnA = this.readString(bytes, offset);
      offset += 4 + portIdOnA.length;

      const channelIdOnA = this.readString(bytes, offset);
      offset += 4 + channelIdOnA.length;

      const ordering = this.decodeChannelOrder(bytes, offset);
      offset += this.getChannelOrderSize(ordering);

      const versionProposal = this.readString(bytes, offset);
      offset += 4 + versionProposal.length;

      const counterpartyVersion = this.readString(bytes, offset);
      offset += 4 + counterpartyVersion.length;

      const proofInit = this.readBytes(bytes, offset);
      offset += 4 + proofInit.length;

      const proofHeightOnA = this.decodeHeight(bytes, offset);
      offset += this.getHeightSize(proofHeightOnA);

      const signer = this.readString(bytes, offset);

      return {
        type: 'channel_open_try',
        portIdOnB,
        connectionHopsOnB,
        portIdOnA,
        channelIdOnA,
        ordering,
        versionProposal,
        counterpartyVersion,
        proofInit,
        proofHeightOnA,
        signer
      };
    } catch (error) {
      console.error('Failed to decode ChannelOpenTry message:', error);
      return null;
    }
  }

  /**
   * Decode ChannelOpenAck message
   */
  private static decodeChannelOpenAckMessage(bytes: Uint8Array, offset: number): IbcChannelOpenAckMessage | null {
    try {
      const portIdOnA = this.readString(bytes, offset);
      offset += 4 + portIdOnA.length;

      const channelIdOnA = this.readString(bytes, offset);
      offset += 4 + channelIdOnA.length;

      const channelIdOnB = this.readString(bytes, offset);
      offset += 4 + channelIdOnB.length;

      const counterpartyVersion = this.readString(bytes, offset);
      offset += 4 + counterpartyVersion.length;

      const proofTry = this.readBytes(bytes, offset);
      offset += 4 + proofTry.length;

      const proofHeightOnB = this.decodeHeight(bytes, offset);
      offset += this.getHeightSize(proofHeightOnB);

      const signer = this.readString(bytes, offset);

      return {
        type: 'channel_open_ack',
        portIdOnA,
        channelIdOnA,
        channelIdOnB,
        counterpartyVersion,
        proofTry,
        proofHeightOnB,
        signer
      };
    } catch (error) {
      console.error('Failed to decode ChannelOpenAck message:', error);
      return null;
    }
  }

  /**
   * Decode ChannelOpenConfirm message
   */
  private static decodeChannelOpenConfirmMessage(bytes: Uint8Array, offset: number): IbcChannelOpenConfirmMessage | null {
    try {
      const portIdOnB = this.readString(bytes, offset);
      offset += 4 + portIdOnB.length;

      const channelIdOnB = this.readString(bytes, offset);
      offset += 4 + channelIdOnB.length;

      const proofAck = this.readBytes(bytes, offset);
      offset += 4 + proofAck.length;

      const proofHeightOnA = this.decodeHeight(bytes, offset);
      offset += this.getHeightSize(proofHeightOnA);

      const signer = this.readString(bytes, offset);

      return {
        type: 'channel_open_confirm',
        portIdOnB,
        channelIdOnB,
        proofAck,
        proofHeightOnA,
        signer
      };
    } catch (error) {
      console.error('Failed to decode ChannelOpenConfirm message:', error);
      return null;
    }
  }

  /**
   * Decode ChannelCloseInit message
   */
  private static decodeChannelCloseInitMessage(bytes: Uint8Array, offset: number): IbcChannelCloseInitMessage | null {
    try {
      const portIdOnA = this.readString(bytes, offset);
      offset += 4 + portIdOnA.length;

      const channelIdOnA = this.readString(bytes, offset);
      offset += 4 + channelIdOnA.length;

      const signer = this.readString(bytes, offset);

      return {
        type: 'channel_close_init',
        portIdOnA,
        channelIdOnA,
        signer
      };
    } catch (error) {
      console.error('Failed to decode ChannelCloseInit message:', error);
      return null;
    }
  }

  /**
   * Decode ChannelCloseConfirm message
   */
  private static decodeChannelCloseConfirmMessage(bytes: Uint8Array, offset: number): IbcChannelCloseConfirmMessage | null {
    try {
      const portIdOnB = this.readString(bytes, offset);
      offset += 4 + portIdOnB.length;

      const channelIdOnB = this.readString(bytes, offset);
      offset += 4 + channelIdOnB.length;

      const proofInit = this.readBytes(bytes, offset);
      offset += 4 + proofInit.length;

      const proofHeightOnA = this.decodeHeight(bytes, offset);
      offset += this.getHeightSize(proofHeightOnA);

      const signer = this.readString(bytes, offset);

      return {
        type: 'channel_close_confirm',
        portIdOnB,
        channelIdOnB,
        proofInit,
        proofHeightOnA,
        signer
      };
    } catch (error) {
      console.error('Failed to decode ChannelCloseConfirm message:', error);
      return null;
    }
  }

  /**
   * Decode Protobuf Any structure
   */
  private static decodeProtobufAny(bytes: Uint8Array, offset: number): ProtobufAny {
    const typeUrl = this.readString(bytes, offset);
    const typeUrlSize = 4 + typeUrl.length;

    const value = this.readBytes(bytes, offset + typeUrlSize);

    // Create Any message object and try to decode it
    const anyMessage: Any = { typeUrl, value };

    // Attempt to decode the nested message
    const decodedNested = this.decodeNestedAny(anyMessage);

    if (decodedNested) {
      return {
        typeUrl,
        value,
        decodedMessage: decodedNested.message,
        decodedType: decodedNested.type,
        isDecoded: true
      };
    } else {
      return {
        typeUrl,
        value,
        isDecoded: false
      };
    }
  }

  /**
   * Calculate size of Protobuf Any structure
   */
  private static getProtobufAnySize(any: ProtobufAny): number {
    return 4 + any.typeUrl.length + // typeUrl string
      4 + any.value.length;    // value bytes
  }

  /**
   * Decode ConnectionCounterparty structure
   */
  private static decodeConnectionCounterparty(bytes: Uint8Array, offset: number): IbcConnectionCounterparty {
    const clientId = this.readString(bytes, offset);
    offset += 4 + clientId.length;

    const connectionId = this.decodeOptionalString(bytes, offset);
    offset += this.getOptionalStringSize(connectionId);

    const prefix = this.readBytes(bytes, offset);
    offset += 4 + prefix.length;

    return {
      clientId,
      connectionId,
      prefix
    };
  }

  /**
   * Calculate size of ConnectionCounterparty structure
   */
  private static getConnectionCounterpartySize(counterparty: IbcConnectionCounterparty): number {
    return 4 + counterparty.clientId.length + // clientId string
      this.getOptionalStringSize(counterparty.connectionId) + // connectionId optional string
      4 + counterparty.prefix.length; // prefix bytes
  }

  /**
   * Decode Optional String (Borsh enum)
   */
  private static decodeOptionalString(bytes: Uint8Array, offset: number): string | null {
    const discriminant = this.readU8(bytes, offset);
    offset += 1;

    if (discriminant === 0) { // None
      return null;
    } else if (discriminant === 1) { // Some
      return this.readString(bytes, offset);
    } else {
      throw new Error(`Unknown OptionalString discriminant: ${discriminant}`);
    }
  }

  /**
   * Calculate size of Optional String (Borsh enum)
   */
  private static getOptionalStringSize(str: string | null): number {
    return 1 + (str ? 4 + str.length : 0); // discriminant + size of string if present
  }

  /**
   * Decode ConnectionVersion structure
   */
  private static decodeConnectionVersion(bytes: Uint8Array, offset: number): IbcConnectionVersion {
    const identifier = this.readString(bytes, offset);
    offset += 4 + identifier.length;

    const features = this.readStrings(bytes, offset);
    offset += this.getStringsSize(features);

    return {
      identifier,
      features
    };
  }

  /**
   * Calculate size of ConnectionVersion structure
   */
  private static getConnectionVersionSize(version: IbcConnectionVersion): number {
    return 4 + version.identifier.length + // identifier string
      4 + this.getStringsSize(version.features); // features strings
  }

  /**
   * Decode ConnectionVersions (Vec<ConnectionVersion>)
   */
  private static decodeConnectionVersions(bytes: Uint8Array, offset: number): IbcConnectionVersion[] {
    const versions: IbcConnectionVersion[] = [];
    const length = this.readU32(bytes, offset);
    offset += 4;

    for (let i = 0; i < length; i++) {
      const version = this.decodeConnectionVersion(bytes, offset);
      versions.push(version);
      offset += this.getConnectionVersionSize(version);
    }
    return versions;
  }

  /**
   * Calculate size of ConnectionVersions (Vec<ConnectionVersion>)
   */
  private static getConnectionVersionsSize(versions: IbcConnectionVersion[]): number {
    let size = 4; // length
    for (const version of versions) {
      size += this.getConnectionVersionSize(version);
    }
    return size;
  }

  /**
   * Decode Optional ConnectionVersion (Borsh enum)
   */
  private static decodeOptionalConnectionVersion(bytes: Uint8Array, offset: number): IbcConnectionVersion | null {
    const discriminant = this.readU8(bytes, offset);
    offset += 1;

    if (discriminant === 0) { // None
      return null;
    } else if (discriminant === 1) { // Some
      return this.decodeConnectionVersion(bytes, offset);
    } else {
      throw new Error(`Unknown OptionalConnectionVersion discriminant: ${discriminant}`);
    }
  }

  /**
   * Calculate size of Optional ConnectionVersion (Borsh enum)
   */
  private static getOptionalConnectionVersionSize(version: IbcConnectionVersion | null): number {
    return 1 + (version ? this.getConnectionVersionSize(version) : 0); // discriminant + size of version if present
  }

  /**
   * Decode Height structure
   */
  private static decodeHeight(bytes: Uint8Array, offset: number): IbcHeight {
    const revisionNumber = Number(this.readU64(bytes, offset));
    offset += 8;
    const revisionHeight = Number(this.readU64(bytes, offset));
    offset += 8;

    return {
      revisionNumber,
      revisionHeight
    };
  }

  /**
   * Calculate size of Height structure
   */
  private static getHeightSize(_height: IbcHeight): number {
    return 8 + 8; // revision_number (u64) + revision_height (u64)
  }

  /**
   * Decode ChannelOrder (Borsh enum)
   */
  private static decodeChannelOrder(bytes: Uint8Array, offset: number): 'none' | 'unordered' | 'ordered' {
    const discriminant = this.readU8(bytes, offset);
    offset += 1;

    if (discriminant === this.CHANNEL_ORDER_NONE) {
      return 'none';
    } else if (discriminant === this.CHANNEL_ORDER_UNORDERED) {
      return 'unordered';
    } else if (discriminant === this.CHANNEL_ORDER_ORDERED) {
      return 'ordered';
    } else {
      throw new Error(`Unknown ChannelOrder discriminant: ${discriminant}`);
    }
  }

  /**
   * Calculate size of ChannelOrder (Borsh enum)
   */
  private static getChannelOrderSize(_ordering: 'none' | 'unordered' | 'ordered'): number {
    return 1; // discriminant only
  }

  /**
   * Decode Strings (Vec<String>)
   */
  private static readStrings(bytes: Uint8Array, offset: number): string[] {
    const strings: string[] = [];
    const length = this.readU32(bytes, offset);
    offset += 4;

    for (let i = 0; i < length; i++) {
      const string = this.readString(bytes, offset);
      strings.push(string);
      offset += 4 + string.length; // 4 bytes for length + string bytes
    }
    return strings;
  }

  /**
   * Calculate size of Strings (Vec<String>)
   */
  private static getStringsSize(strings: string[]): number {
    let size = 4; // length
    for (const string of strings) {
      size += 4 + string.length; // 4 bytes for length + string bytes
    }
    return size;
  }

  /**
   * Decode ACK message (MsgAcknowledgement)
   */
  private static decodeAckMessage(bytes: Uint8Array, offset: number): IbcAckMessage | null {
    try {
      // Decode MsgAcknowledgement structure: packet, acknowledgement, proof_acked_on_b, proof_height_on_b, signer
      const packet = this.decodePacket(bytes, offset);
      if (!packet) return null;

      // Skip packet data and decode acknowledgement
      let currentOffset = offset + this.getPacketSize(packet);
      const acknowledgementBytes = this.readBytes(bytes, currentOffset);
      currentOffset += 4 + acknowledgementBytes.length;

      // Convert acknowledgement bytes to string
      const acknowledgementString = new TextDecoder().decode(acknowledgementBytes);

      // Parse the string as JSON
      let acknowledgementJson;
      try {
        acknowledgementJson = JSON.parse(acknowledgementString);

        // Check if the result contains base64 encoded data (success case)
        if (acknowledgementJson.result && typeof acknowledgementJson.result === 'string') {
          try {
            // Decode base64 to bytes
            const decodedBytes = this.base64ToBytes(acknowledgementJson.result);

            // According to IBC specs, success is 0x01 (not 0x00)
            if (decodedBytes.length === 1) {
              const returnCode = decodedBytes[0];
              acknowledgementJson.decodedResult = {
                returnCode,
                meaning: returnCode === 1 ? 'SUCCESS' : `UNKNOWN(${returnCode})`
              };
            } else {
              // For longer data, try to decode as string
              try {
                const decodedString = new TextDecoder().decode(decodedBytes);
                acknowledgementJson.decodedResult = decodedString;
              } catch {
                // If string decoding fails, show as hex
                acknowledgementJson.decodedResult = this.bytesToHex(decodedBytes);
              }
            }
          } catch (base64Error) {
            console.warn('Failed to decode base64 result:', base64Error);
          }
        }

        // Check if there's an error field (error case)
        if (acknowledgementJson.error && typeof acknowledgementJson.error === 'string') {
          // Error messages are plaintext according to IBC specs
          acknowledgementJson.decodedResult = {
            type: 'ERROR',
            message: acknowledgementJson.error
          };
        }
      } catch (jsonError) {
        console.warn('Failed to parse acknowledgement as JSON, returning as string:', jsonError);
        acknowledgementJson = acknowledgementString;
      }

      // Decode proof_acked_on_b (CommitmentProofBytes)
      const proofAckedOnB = this.readBytes(bytes, currentOffset);
      currentOffset += 4 + proofAckedOnB.length;

      // Decode proof_height_on_b (Height)
      const proofHeightOnB = this.decodeHeight(bytes, currentOffset);
      currentOffset += this.getHeightSize(proofHeightOnB);

      // Decode signer (String)
      const signer = this.readString(bytes, currentOffset);

      return {
        type: 'ack',
        packet,
        acknowledgement: acknowledgementJson,
        proofAckedOnB,
        proofHeightOnB,
        signer
      };
    } catch (error) {
      console.error('Failed to decode ACK message:', error);
      return null;
    }
  }

  /**
   * Decode Timeout message (MsgTimeout)
   */
  private static decodeTimeoutMessage(bytes: Uint8Array, offset: number): IbcTimeoutMessage | null {
    try {
      // Decode MsgTimeout structure: packet, next_seq_recv_on_b, proof_unreceived_on_b, proof_height_on_b, signer
      const packet = this.decodePacket(bytes, offset);
      if (!packet) return null;

      let currentOffset = offset + this.getPacketSize(packet);

      // Decode next_seq_recv_on_b (Sequence - u64)
      const nextSeqRecvOnB = this.readU64(bytes, currentOffset).toString();
      currentOffset += 8;

      // Decode proof_unreceived_on_b (CommitmentProofBytes)
      const proofUnreceivedOnB = this.readBytes(bytes, currentOffset);
      currentOffset += 4 + proofUnreceivedOnB.length;

      // Decode proof_height_on_b (Height)
      const proofHeightOnB = this.decodeHeight(bytes, currentOffset);
      currentOffset += this.getHeightSize(proofHeightOnB);

      // Decode signer (String)
      const signer = this.readString(bytes, currentOffset);

      return {
        type: 'timeout',
        packet,
        nextSeqRecvOnB,
        proofUnreceivedOnB,
        proofHeightOnB,
        signer
      };
    } catch (error) {
      console.error('Failed to decode Timeout message:', error);
      return null;
    }
  }

  /**
   * Decode TimeoutOnClose message (MsgTimeoutOnClose)
   */
  private static decodeTimeoutOnCloseMessage(bytes: Uint8Array, offset: number): IbcTimeoutOnCloseMessage | null {
    try {
      // Decode MsgTimeoutOnClose structure: packet, next_seq_recv_on_b, proof_unreceived_on_b, proof_close_on_b, proof_height_on_b, signer
      const packet = this.decodePacket(bytes, offset);
      if (!packet) return null;

      let currentOffset = offset + this.getPacketSize(packet);

      // Decode next_seq_recv_on_b (Sequence - u64)
      const nextSeqRecvOnB = this.readU64(bytes, currentOffset).toString();
      currentOffset += 8;

      // Decode proof_unreceived_on_b (CommitmentProofBytes)
      const proofUnreceivedOnB = this.readBytes(bytes, currentOffset);
      currentOffset += 4 + proofUnreceivedOnB.length;

      // Decode proof_close_on_b (CommitmentProofBytes)
      const proofCloseOnB = this.readBytes(bytes, currentOffset);
      currentOffset += 4 + proofCloseOnB.length;

      // Decode proof_height_on_b (Height)
      const proofHeightOnB = this.decodeHeight(bytes, currentOffset);
      currentOffset += this.getHeightSize(proofHeightOnB);

      // Decode signer (String)
      const signer = this.readString(bytes, currentOffset);

      return {
        type: 'timeout_on_close',
        packet,
        nextSeqRecvOnB,
        proofUnreceivedOnB,
        proofCloseOnB,
        proofHeightOnB,
        signer
      };
    } catch (error) {
      console.error('Failed to decode TimeoutOnClose message:', error);
      return null;
    }
  }

  /**
   * Decode Recv message (MsgRecvPacket)
   */
  private static decodeRecvMessage(bytes: Uint8Array, offset: number): IbcRecvMessage | null {
    try {
      // Decode MsgRecvPacket structure: packet, proof_commitment_on_a, proof_height_on_a, signer
      const packet = this.decodePacket(bytes, offset);
      if (!packet) return null;

      let currentOffset = offset + this.getPacketSize(packet);

      // Decode proof_commitment_on_a (CommitmentProofBytes)
      const proofCommitmentOnA = this.readBytes(bytes, currentOffset);
      currentOffset += 4 + proofCommitmentOnA.length;

      // Decode proof_height_on_a (Height)
      const proofHeightOnA = this.decodeHeight(bytes, currentOffset);
      currentOffset += this.getHeightSize(proofHeightOnA);

      // Decode signer (String)
      const signer = this.readString(bytes, currentOffset);

      return {
        type: 'recv',
        packet,
        proofCommitmentOnA,
        proofHeightOnA,
        signer
      };
    } catch (error) {
      console.error('Failed to decode Recv message:', error);
      return null;
    }
  }

  /**
   * Decode TimeoutHeight (Borsh enum)
   */
  private static decodeTimeoutHeight(bytes: Uint8Array, offset: number): { timeoutHeight: TimeoutHeight, size: number } {
    const discriminant = this.readU8(bytes, offset);
    let currentOffset = offset + 1;

    if (discriminant === this.TIMEOUT_HEIGHT_NEVER) {
      return {
        timeoutHeight: { type: 'never' },
        size: 1
      };
    } else if (discriminant === this.TIMEOUT_HEIGHT_AT) {
      // Read Height structure: revision_number (u64) + revision_height (u64)
      const revisionNumber = Number(this.readU64(bytes, currentOffset));
      currentOffset += 8;
      const revisionHeight = Number(this.readU64(bytes, currentOffset));
      currentOffset += 8;

      return {
        timeoutHeight: {
          type: 'at',
          revisionNumber,
          revisionHeight
        },
        size: 1 + 8 + 8 // discriminant + 2 u64s
      };
    } else {
      throw new Error(`Unknown TimeoutHeight discriminant: ${discriminant}`);
    }
  }

  /**
   * Decode TimeoutTimestamp (Borsh enum)
   */
  private static decodeTimeoutTimestamp(bytes: Uint8Array, offset: number): { timeoutTimestamp: TimeoutTimestamp, size: number } {
    const discriminant = this.readU8(bytes, offset);
    let currentOffset = offset + 1;

    if (discriminant === this.TIMEOUT_TIMESTAMP_NEVER) {
      return {
        timeoutTimestamp: { type: 'never' },
        size: 1
      };
    } else if (discriminant === this.TIMEOUT_TIMESTAMP_AT) {
      // Read Timestamp as u64 nanoseconds
      const nanoseconds = this.readU64(bytes, currentOffset);
      currentOffset += 8;

      return {
        timeoutTimestamp: {
          type: 'at',
          nanoseconds
        },
        size: 1 + 8 // discriminant + u64
      };
    } else {
      throw new Error(`Unknown TimeoutTimestamp discriminant: ${discriminant}`);
    }
  }

  /**
   * Decode Packet structure
   */
  private static decodePacket(bytes: Uint8Array, offset: number): IbcPacket | null {
    try {
      let currentOffset = offset;

      // Read sequence (u64)
      const sequence = this.readU64(bytes, currentOffset);
      currentOffset += 8;

      // Read port_id_on_a (String)
      const sourcePort = this.readString(bytes, currentOffset);
      currentOffset += 4 + sourcePort.length; // 4 bytes for length + string bytes

      // Read chan_id_on_a (String)
      const sourceChannel = this.readString(bytes, currentOffset);
      currentOffset += 4 + sourceChannel.length;

      // Read port_id_on_b (String)
      const destPort = this.readString(bytes, currentOffset);
      currentOffset += 4 + destPort.length;

      // Read chan_id_on_b (String)
      const destChannel = this.readString(bytes, currentOffset);
      currentOffset += 4 + destChannel.length;

      // Read data (Vec<u8>)
      const data = this.readBytes(bytes, currentOffset);
      currentOffset += 4 + data.length; // 4 bytes for length + data bytes

      // Read timeout_height_on_b (TimeoutHeight enum)
      const timeoutHeightResult = this.decodeTimeoutHeight(bytes, currentOffset);
      currentOffset += timeoutHeightResult.size;

      // Read timeout_timestamp_on_b (TimeoutTimestamp enum)
      const timeoutTimestampResult = this.decodeTimeoutTimestamp(bytes, currentOffset);
      currentOffset += timeoutTimestampResult.size;

      return {
        sequence: sequence.toString(),
        sourcePort,
        sourceChannel,
        destPort,
        destChannel,
        data,
        timeoutHeight: timeoutHeightResult.timeoutHeight,
        timeoutTimestamp: timeoutTimestampResult.timeoutTimestamp
      };
    } catch (error) {
      console.error('Failed to decode packet:', error);
      return null;
    }
  }

  /**
   * Calculate packet size for offset calculation
   */
  private static getPacketSize(packet: IbcPacket): number {
    let size = 8 + // sequence (u64)
      4 + packet.sourcePort.length + // sourcePort
      4 + packet.sourceChannel.length + // sourceChannel
      4 + packet.destPort.length + // destPort
      4 + packet.destChannel.length + // destChannel
      4 + packet.data.length; // data

    // Add timeoutHeight size
    if (packet.timeoutHeight?.type === 'never') {
      size += 1; // discriminant only
    } else {
      size += 1 + 8 + 8; // discriminant + revision_number + revision_height
    }

    // Add timeoutTimestamp size
    if (packet.timeoutTimestamp?.type === 'never') {
      size += 1; // discriminant only
    } else {
      size += 1 + 8; // discriminant + nanoseconds
    }

    return size;
  }

  // Utility methods for Borsh deserialization
  private static hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  private static readU8(bytes: Uint8Array, offset: number): number {
    return bytes[offset];
  }

  private static readU32(bytes: Uint8Array, offset: number): number {
    const view = new DataView(bytes.buffer, offset, 4);
    return view.getUint32(0, true); // little-endian
  }

  private static readU64(bytes: Uint8Array, offset: number): bigint {
    const view = new DataView(bytes.buffer, offset, 8);
    return view.getBigUint64(0, true); // little-endian
  }

  private static readString(bytes: Uint8Array, offset: number): string {
    const length = this.readU32(bytes, offset);
    const stringBytes = bytes.slice(offset + 4, offset + 4 + length);
    return new TextDecoder().decode(stringBytes);
  }

  private static readBytes(bytes: Uint8Array, offset: number): Uint8Array {
    const length = this.readU32(bytes, offset);
    return bytes.slice(offset + 4, offset + 4 + length);
  }

  /**
   * Convert base64 string to Uint8Array
   */
  private static base64ToBytes(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Convert Uint8Array to hex string
   */
  private static bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Decode nested Any type in any IBC message
   */
  private static decodeNestedAny(anyMessage: Any): DecodedNestedMessage | null {
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

        case '/ibc.core.channel.v1.MsgRecvPacket':
          const msgRecvPacket = MsgRecvPacket.decode(anyMessage.value);
          return {
            type: 'MsgRecvPacket',
            message: msgRecvPacket,
            typeUrl: anyMessage.typeUrl
          };

        case '/ibc.core.channel.v1.MsgAcknowledgement':
          const msgAcknowledgement = MsgAcknowledgement.decode(anyMessage.value);
          return {
            type: 'MsgAcknowledgement',
            message: msgAcknowledgement,
            typeUrl: anyMessage.typeUrl
          };

        case '/ibc.core.channel.v1.MsgTimeout':
          const msgTimeout = MsgTimeout.decode(anyMessage.value);
          return {
            type: 'MsgTimeout',
            message: msgTimeout,
            typeUrl: anyMessage.typeUrl
          };

        case '/ibc.core.channel.v1.MsgTimeoutOnClose':
          const msgTimeoutOnClose = MsgTimeoutOnClose.decode(anyMessage.value);
          return {
            type: 'MsgTimeoutOnClose',
            message: msgTimeoutOnClose,
            typeUrl: anyMessage.typeUrl
          };

        case '/ibc.core.channel.v2.MsgSendPacket':
          const msgSendPacket = MsgSendPacket.decode(anyMessage.value);
          return {
            type: 'MsgSendPacket',
            message: msgSendPacket,
            typeUrl: anyMessage.typeUrl
          };

        case '/ibc.core.client.v1.MsgUpdateClient':
          const msgUpdateClient = MsgUpdateClient.decode(anyMessage.value);
          return {
            type: 'MsgUpdateClient',
            message: msgUpdateClient,
            typeUrl: anyMessage.typeUrl
          };

        case '/ibc.core.client.v1.MsgCreateClient':
          const msgCreateClient = MsgCreateClient.decode(anyMessage.value);
          return {
            type: 'MsgCreateClient',
            message: msgCreateClient,
            typeUrl: anyMessage.typeUrl
          };

        default:
          // Unknown typeUrl, return null to indicate we couldn't decode it
          console.warn(`Unknown typeUrl for decoding: ${anyMessage.typeUrl}`);
          return null;
      }
    } catch (error) {
      console.error('Failed to decode nested Any:', error);
      return null;
    }
  }

  /**
   * Convert TimeoutTimestamp to human-readable format
   */
  static formatTimeoutTimestamp(timeoutTimestamp: TimeoutTimestamp): string {
    if (timeoutTimestamp.type === 'never') {
      return 'Never';
    } else {
      // Convert nanoseconds to Date
      const milliseconds = Number(timeoutTimestamp.nanoseconds! / 1000000n);
      const date = new Date(milliseconds);
      return date.toISOString();
    }
  }

  /**
   * Convert TimeoutHeight to human-readable format
   */
  static formatTimeoutHeight(timeoutHeight: TimeoutHeight): string {
    if (timeoutHeight.type === 'never') {
      return 'Never (0-0)';
    } else {
      return `${timeoutHeight.revisionNumber}-${timeoutHeight.revisionHeight}`;
    }
  }

  /**
   * Helper method to format decoded IBC messages for display
   */
  static formatDecodedMessage(decoded: DecodedIbcMessage): string {
    const lines: string[] = [];
    lines.push(`Message Type: ${decoded.type}`);

    switch (decoded.type) {
      case 'create_client':
        lines.push(`Client State Type: ${decoded.clientState.typeUrl}`);
        if (decoded.clientState.isDecoded) {
          lines.push(`Client State Decoded Type: ${decoded.clientState.decodedType}`);
          lines.push(`Client State Details: ${JSON.stringify(decoded.clientState.decodedMessage, null, 2)}`);
        }
        lines.push(`Consensus State Type: ${decoded.consensusState.typeUrl}`);
        if (decoded.consensusState.isDecoded) {
          lines.push(`Consensus State Decoded Type: ${decoded.consensusState.decodedType}`);
          lines.push(`Consensus State Details: ${JSON.stringify(decoded.consensusState.decodedMessage, null, 2)}`);
        }
        lines.push(`Signer: ${decoded.signer}`);
        break;

      case 'update_client':
        lines.push(`Client ID: ${decoded.clientId}`);
        lines.push(`Client Message Type: ${decoded.clientMessage.typeUrl}`);
        if (decoded.clientMessage.isDecoded) {
          lines.push(`Client Message Decoded Type: ${decoded.clientMessage.decodedType}`);
          lines.push(`Client Message Details: ${JSON.stringify(decoded.clientMessage.decodedMessage, null, 2)}`);
        }
        lines.push(`Signer: ${decoded.signer}`);
        break;

      case 'upgrade_client':
        lines.push(`Client ID: ${decoded.clientId}`);
        lines.push(`Upgraded Client State Type: ${decoded.upgradedClientState.typeUrl}`);
        if (decoded.upgradedClientState.isDecoded) {
          lines.push(`Upgraded Client State Decoded Type: ${decoded.upgradedClientState.decodedType}`);
          lines.push(`Upgraded Client State Details: ${JSON.stringify(decoded.upgradedClientState.decodedMessage, null, 2)}`);
        }
        lines.push(`Upgraded Consensus State Type: ${decoded.upgradedConsensusState.typeUrl}`);
        if (decoded.upgradedConsensusState.isDecoded) {
          lines.push(`Upgraded Consensus State Decoded Type: ${decoded.upgradedConsensusState.decodedType}`);
          lines.push(`Upgraded Consensus State Details: ${JSON.stringify(decoded.upgradedConsensusState.decodedMessage, null, 2)}`);
        }
        lines.push(`Proof Upgrade Client Length: ${decoded.proofUpgradeClient.length} bytes`);
        lines.push(`Proof Upgrade Consensus State Length: ${decoded.proofUpgradeConsensusState.length} bytes`);
        lines.push(`Signer: ${decoded.signer}`);
        break;

      case 'submit_misbehaviour':
        lines.push(`Client ID: ${decoded.clientId}`);
        lines.push(`Misbehaviour Type: ${decoded.misbehaviour.typeUrl}`);
        if (decoded.misbehaviour.isDecoded) {
          lines.push(`Misbehaviour Decoded Type: ${decoded.misbehaviour.decodedType}`);
          lines.push(`Misbehaviour Details: ${JSON.stringify(decoded.misbehaviour.decodedMessage, null, 2)}`);
        }
        lines.push(`Signer: ${decoded.signer}`);
        break;

      case 'recover_client':
        lines.push(`Subject Client ID: ${decoded.subjectClientId}`);
        lines.push(`Substitute Client ID: ${decoded.substituteClientId}`);
        lines.push(`Signer: ${decoded.signer}`);
        break;

      case 'connection_open_init':
        lines.push(`Client ID: ${decoded.clientIdOnA}`);
        lines.push(`Counterparty Client ID: ${decoded.counterparty.clientId}`);
        lines.push(`Counterparty Connection ID: ${decoded.counterparty.connectionId || 'None'}`);
        lines.push(`Delay Period: ${decoded.delayPeriodNanos} nanos`);
        lines.push(`Version: ${decoded.version ? decoded.version.identifier : 'None'}`);
        lines.push(`Signer: ${decoded.signer}`);
        break;

      case 'connection_open_try':
        lines.push(`Client ID: ${decoded.clientIdOnB}`);
        lines.push(`Client State On A Type: ${decoded.clientStateOnA.typeUrl}`);
        if (decoded.clientStateOnA.isDecoded) {
          lines.push(`Client State On A Decoded Type: ${decoded.clientStateOnA.decodedType}`);
          lines.push(`Client State On A Details: ${JSON.stringify(decoded.clientStateOnA.decodedMessage, null, 2)}`);
        }
        lines.push(`Counterparty Client ID: ${decoded.counterparty.clientId}`);
        lines.push(`Counterparty Connection ID: ${decoded.counterparty.connectionId || 'None'}`);
        lines.push(`Delay Period: ${decoded.delayPeriodNanos} nanos`);
        lines.push(`Counterparty Versions: ${decoded.counterpartyVersions.map(v => v.identifier).join(', ')}`);
        lines.push(`Consensus Height On A: ${decoded.consensusHeightOnA.revisionNumber}-${decoded.consensusHeightOnA.revisionHeight}`);
        lines.push(`Signer: ${decoded.signer}`);
        break;

      case 'connection_open_ack':
        lines.push(`Connection ID On A: ${decoded.connectionIdOnA}`);
        lines.push(`Connection ID On B: ${decoded.connectionIdOnB}`);
        lines.push(`Client State On B Type: ${decoded.clientStateOnB.typeUrl}`);
        if (decoded.clientStateOnB.isDecoded) {
          lines.push(`Client State On B Decoded Type: ${decoded.clientStateOnB.decodedType}`);
          lines.push(`Client State On B Details: ${JSON.stringify(decoded.clientStateOnB.decodedMessage, null, 2)}`);
        }
        lines.push(`Consensus Height On B: ${decoded.consensusHeightOnB.revisionNumber}-${decoded.consensusHeightOnB.revisionHeight}`);
        lines.push(`Version: ${decoded.version.identifier}`);
        lines.push(`Signer: ${decoded.signer}`);
        break;

      case 'connection_open_confirm':
        lines.push(`Connection ID On B: ${decoded.connectionIdOnB}`);
        lines.push(`Proof Height On A: ${decoded.proofHeightOnA.revisionNumber}-${decoded.proofHeightOnA.revisionHeight}`);
        lines.push(`Signer: ${decoded.signer}`);
        break;

      case 'channel_open_init':
        lines.push(`Port ID A: ${decoded.portIdOnA}`);
        lines.push(`Port ID B: ${decoded.portIdOnB}`);
        lines.push(`Connection Hops: [${decoded.connectionHopsOnA.join(', ')}]`);
        lines.push(`Ordering: ${decoded.ordering}`);
        lines.push(`Version: ${decoded.versionProposal}`);
        lines.push(`Signer: ${decoded.signer}`);
        break;

      case 'channel_open_try':
        lines.push(`Port ID B: ${decoded.portIdOnB}`);
        lines.push(`Port ID A: ${decoded.portIdOnA}`);
        lines.push(`Channel ID A: ${decoded.channelIdOnA}`);
        lines.push(`Connection Hops: [${decoded.connectionHopsOnB.join(', ')}]`);
        lines.push(`Ordering: ${decoded.ordering}`);
        lines.push(`Version Proposal: ${decoded.versionProposal}`);
        lines.push(`Counterparty Version: ${decoded.counterpartyVersion}`);
        lines.push(`Proof Height On A: ${decoded.proofHeightOnA.revisionNumber}-${decoded.proofHeightOnA.revisionHeight}`);
        lines.push(`Signer: ${decoded.signer}`);
        break;

      case 'channel_open_ack':
        lines.push(`Port ID A: ${decoded.portIdOnA}`);
        lines.push(`Channel ID A: ${decoded.channelIdOnA}`);
        lines.push(`Channel ID B: ${decoded.channelIdOnB}`);
        lines.push(`Counterparty Version: ${decoded.counterpartyVersion}`);
        lines.push(`Proof Height On B: ${decoded.proofHeightOnB.revisionNumber}-${decoded.proofHeightOnB.revisionHeight}`);
        lines.push(`Signer: ${decoded.signer}`);
        break;

      case 'channel_open_confirm':
        lines.push(`Port ID B: ${decoded.portIdOnB}`);
        lines.push(`Channel ID B: ${decoded.channelIdOnB}`);
        lines.push(`Proof Height On A: ${decoded.proofHeightOnA.revisionNumber}-${decoded.proofHeightOnA.revisionHeight}`);
        lines.push(`Signer: ${decoded.signer}`);
        break;

      case 'channel_close_init':
        lines.push(`Port ID A: ${decoded.portIdOnA}`);
        lines.push(`Channel ID A: ${decoded.channelIdOnA}`);
        lines.push(`Signer: ${decoded.signer}`);
        break;

      case 'channel_close_confirm':
        lines.push(`Port ID B: ${decoded.portIdOnB}`);
        lines.push(`Channel ID B: ${decoded.channelIdOnB}`);
        lines.push(`Proof Height On A: ${decoded.proofHeightOnA.revisionNumber}-${decoded.proofHeightOnA.revisionHeight}`);
        lines.push(`Signer: ${decoded.signer}`);
        break;

      case 'ack':
        lines.push(`Packet Sequence: ${decoded.packet.sequence}`);
        lines.push(`Source: ${decoded.packet.sourcePort}/${decoded.packet.sourceChannel}`);
        lines.push(`Dest: ${decoded.packet.destPort}/${decoded.packet.destChannel}`);
        if (decoded.packet.timeoutTimestamp) {
          lines.push(`Timeout Timestamp: ${this.formatTimeoutTimestamp(decoded.packet.timeoutTimestamp)}`);
        }
        if (decoded.packet.timeoutHeight) {
          lines.push(`Timeout Height: ${this.formatTimeoutHeight(decoded.packet.timeoutHeight)}`);
        }
        lines.push(`Acknowledgement: ${JSON.stringify(decoded.acknowledgement)}`);
        lines.push(`Proof Acked On B Length: ${decoded.proofAckedOnB.length} bytes`);
        lines.push(`Proof Height On B: ${decoded.proofHeightOnB.revisionNumber}-${decoded.proofHeightOnB.revisionHeight}`);
        lines.push(`Signer: ${decoded.signer}`);
        break;

      case 'timeout':
        lines.push(`Packet Sequence: ${decoded.packet.sequence}`);
        lines.push(`Source: ${decoded.packet.sourcePort}/${decoded.packet.sourceChannel}`);
        lines.push(`Dest: ${decoded.packet.destPort}/${decoded.packet.destChannel}`);
        if (decoded.packet.timeoutTimestamp) {
          lines.push(`Timeout Timestamp: ${this.formatTimeoutTimestamp(decoded.packet.timeoutTimestamp)}`);
        }
        if (decoded.packet.timeoutHeight) {
          lines.push(`Timeout Height: ${this.formatTimeoutHeight(decoded.packet.timeoutHeight)}`);
        }
        lines.push(`Next Seq Recv On B: ${decoded.nextSeqRecvOnB}`);
        lines.push(`Proof Unreceived On B Length: ${decoded.proofUnreceivedOnB.length} bytes`);
        lines.push(`Proof Height On B: ${decoded.proofHeightOnB.revisionNumber}-${decoded.proofHeightOnB.revisionHeight}`);
        lines.push(`Signer: ${decoded.signer}`);
        break;

      case 'timeout_on_close':
        lines.push(`Packet Sequence: ${decoded.packet.sequence}`);
        lines.push(`Source: ${decoded.packet.sourcePort}/${decoded.packet.sourceChannel}`);
        lines.push(`Dest: ${decoded.packet.destPort}/${decoded.packet.destChannel}`);
        if (decoded.packet.timeoutTimestamp) {
          lines.push(`Timeout Timestamp: ${this.formatTimeoutTimestamp(decoded.packet.timeoutTimestamp)}`);
        }
        if (decoded.packet.timeoutHeight) {
          lines.push(`Timeout Height: ${this.formatTimeoutHeight(decoded.packet.timeoutHeight)}`);
        }
        lines.push(`Next Seq Recv On B: ${decoded.nextSeqRecvOnB}`);
        lines.push(`Proof Unreceived On B Length: ${decoded.proofUnreceivedOnB.length} bytes`);
        lines.push(`Proof Close On B Length: ${decoded.proofCloseOnB.length} bytes`);
        lines.push(`Proof Height On B: ${decoded.proofHeightOnB.revisionNumber}-${decoded.proofHeightOnB.revisionHeight}`);
        lines.push(`Signer: ${decoded.signer}`);
        break;

      case 'recv':
        lines.push(`Packet Sequence: ${decoded.packet.sequence}`);
        lines.push(`Source: ${decoded.packet.sourcePort}/${decoded.packet.sourceChannel}`);
        lines.push(`Dest: ${decoded.packet.destPort}/${decoded.packet.destChannel}`);
        if (decoded.packet.timeoutTimestamp) {
          lines.push(`Timeout Timestamp: ${this.formatTimeoutTimestamp(decoded.packet.timeoutTimestamp)}`);
        }
        if (decoded.packet.timeoutHeight) {
          lines.push(`Timeout Height: ${this.formatTimeoutHeight(decoded.packet.timeoutHeight)}`);
        }
        lines.push(`Proof Commitment On A Length: ${decoded.proofCommitmentOnA.length} bytes`);
        lines.push(`Proof Height On A: ${decoded.proofHeightOnA.revisionNumber}-${decoded.proofHeightOnA.revisionHeight}`);
        lines.push(`Signer: ${decoded.signer}`);
        break;

      default:
        lines.push(`Details: ${JSON.stringify(decoded, null, 2)}`);
    }

    return lines.join('\n');
  }

  /**
   * Validate that our decoder captures all fields from the Rust structs
   */
  static validateClientMessageFields(decoded: DecodedIbcMessage): { isValid: boolean; missingFields: string[] } {
    const missingFields: string[] = [];

    switch (decoded.type) {
      case 'create_client':
        // Rust: MsgCreateClient { client_state: Any, consensus_state: Any, signer: Signer }
        if (!decoded.clientState) missingFields.push('clientState');
        if (!decoded.consensusState) missingFields.push('consensusState');
        if (!decoded.signer) missingFields.push('signer');
        break;

      case 'update_client':
        // Rust: MsgUpdateClient { client_id: ClientId, client_message: Any, signer: Signer }
        if (!decoded.clientId) missingFields.push('clientId');
        if (!decoded.clientMessage) missingFields.push('clientMessage');
        if (!decoded.signer) missingFields.push('signer');
        break;

      case 'upgrade_client':
        // Rust: MsgUpgradeClient { client_id, upgraded_client_state, upgraded_consensus_state, proof_upgrade_client, proof_upgrade_consensus_state, signer }
        if (!decoded.clientId) missingFields.push('clientId');
        if (!decoded.upgradedClientState) missingFields.push('upgradedClientState');
        if (!decoded.upgradedConsensusState) missingFields.push('upgradedConsensusState');
        if (!decoded.proofUpgradeClient) missingFields.push('proofUpgradeClient');
        if (!decoded.proofUpgradeConsensusState) missingFields.push('proofUpgradeConsensusState');
        if (!decoded.signer) missingFields.push('signer');
        break;

      case 'submit_misbehaviour':
        // Rust: MsgSubmitMisbehaviour { client_id: ClientId, misbehaviour: ProtoAny, signer: Signer }
        if (!decoded.clientId) missingFields.push('clientId');
        if (!decoded.misbehaviour) missingFields.push('misbehaviour');
        if (!decoded.signer) missingFields.push('signer');
        break;

      case 'recover_client':
        // Rust: MsgRecoverClient { subject_client_id: ClientId, substitute_client_id: ClientId, signer: Signer }
        if (!decoded.subjectClientId) missingFields.push('subjectClientId');
        if (!decoded.substituteClientId) missingFields.push('substituteClientId');
        if (!decoded.signer) missingFields.push('signer');
        break;

      default:
        // For non-client messages, we assume they're valid
        break;
    }

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  /**
   * Validate that our decoder captures all fields from the Rust packet message structs
   */
  static validatePacketMessageFields(decoded: DecodedIbcMessage): { isValid: boolean; missingFields: string[] } {
    const missingFields: string[] = [];

    switch (decoded.type) {
      case 'ack':
        // Rust: MsgAcknowledgement { packet: Packet, acknowledgement: Acknowledgement, proof_acked_on_b: CommitmentProofBytes, proof_height_on_b: Height, signer: Signer }
        if (!decoded.packet) missingFields.push('packet');
        if (!decoded.acknowledgement) missingFields.push('acknowledgement');
        if (!decoded.proofAckedOnB) missingFields.push('proofAckedOnB');
        if (!decoded.proofHeightOnB) missingFields.push('proofHeightOnB');
        if (!decoded.signer) missingFields.push('signer');
        break;

      case 'timeout':
        // Rust: MsgTimeout { packet: Packet, next_seq_recv_on_b: Sequence, proof_unreceived_on_b: CommitmentProofBytes, proof_height_on_b: Height, signer: Signer }
        if (!decoded.packet) missingFields.push('packet');
        if (!decoded.nextSeqRecvOnB) missingFields.push('nextSeqRecvOnB');
        if (!decoded.proofUnreceivedOnB) missingFields.push('proofUnreceivedOnB');
        if (!decoded.proofHeightOnB) missingFields.push('proofHeightOnB');
        if (!decoded.signer) missingFields.push('signer');
        break;

      case 'timeout_on_close':
        // Rust: MsgTimeoutOnClose { packet: Packet, next_seq_recv_on_b: Sequence, proof_unreceived_on_b: CommitmentProofBytes, proof_close_on_b: CommitmentProofBytes, proof_height_on_b: Height, signer: Signer }
        if (!decoded.packet) missingFields.push('packet');
        if (!decoded.nextSeqRecvOnB) missingFields.push('nextSeqRecvOnB');
        if (!decoded.proofUnreceivedOnB) missingFields.push('proofUnreceivedOnB');
        if (!decoded.proofCloseOnB) missingFields.push('proofCloseOnB');
        if (!decoded.proofHeightOnB) missingFields.push('proofHeightOnB');
        if (!decoded.signer) missingFields.push('signer');
        break;

      case 'recv':
        // Rust: MsgRecvPacket { packet: Packet, proof_commitment_on_a: CommitmentProofBytes, proof_height_on_a: Height, signer: Signer }
        if (!decoded.packet) missingFields.push('packet');
        if (!decoded.proofCommitmentOnA) missingFields.push('proofCommitmentOnA');
        if (!decoded.proofHeightOnA) missingFields.push('proofHeightOnA');
        if (!decoded.signer) missingFields.push('signer');
        break;

      default:
        // For non-packet messages, we assume they're valid
        break;
    }

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  /**
   * Example usage and testing method
   */
  static testDecoding(hexData: string): void {
    console.log('=== IBC Message Decoder Test ===');
    console.log(`Input: ${hexData.substring(0, 32)}...`);

    const decoded = this.decodeIbcMessage(hexData);
    if (!decoded) {
      console.log('❌ Failed to decode message');
      return;
    }

    console.log('✅ Successfully decoded message');
    console.log(this.formatDecodedMessage(decoded));

    // Validate client messages
    if (['create_client', 'update_client', 'upgrade_client', 'submit_misbehaviour', 'recover_client'].includes(decoded.type)) {
      const validation = this.validateClientMessageFields(decoded);
      if (validation.isValid) {
        console.log('✅ All Rust client message fields are captured');
      } else {
        console.log(`❌ Missing client message fields: ${validation.missingFields.join(', ')}`);
      }
    }

    // Validate packet messages
    if (['ack', 'timeout', 'timeout_on_close', 'recv'].includes(decoded.type)) {
      const validation = this.validatePacketMessageFields(decoded);
      if (validation.isValid) {
        console.log('✅ All Rust packet message fields are captured');
      } else {
        console.log(`❌ Missing packet message fields: ${validation.missingFields.join(', ')}`);
      }
    }

    console.log('=== End Test ===\n');
  }

  /**
   * Get supported message types
   */
  static getSupportedMessageTypes(): string[] {
    return [
      // Client messages
      'create_client',
      'update_client',
      'upgrade_client',
      'submit_misbehaviour',
      'recover_client',
      // Connection messages
      'connection_open_init',
      'connection_open_try',
      'connection_open_ack',
      'connection_open_confirm',
      // Channel messages
      'channel_open_init',
      'channel_open_try',
      'channel_open_ack',
      'channel_open_confirm',
      'channel_close_init',
      'channel_close_confirm',
      // Packet messages
      'recv',
      'ack',
      'timeout',
      'timeout_on_close'
    ];
  }

  /**
   * Get summary of decoded protobuf Any fields in a message
   */
  static getDecodedAnyFieldsSummary(decoded: DecodedIbcMessage): { fieldName: string; typeUrl: string; decodedType: string | null; isDecoded: boolean }[] {
    const anyFields: { fieldName: string; typeUrl: string; decodedType: string | null; isDecoded: boolean }[] = [];

    switch (decoded.type) {
      case 'create_client':
        anyFields.push({
          fieldName: 'clientState',
          typeUrl: decoded.clientState.typeUrl,
          decodedType: decoded.clientState.decodedType || null,
          isDecoded: decoded.clientState.isDecoded || false
        });
        anyFields.push({
          fieldName: 'consensusState',
          typeUrl: decoded.consensusState.typeUrl,
          decodedType: decoded.consensusState.decodedType || null,
          isDecoded: decoded.consensusState.isDecoded || false
        });
        break;

      case 'update_client':
        anyFields.push({
          fieldName: 'clientMessage',
          typeUrl: decoded.clientMessage.typeUrl,
          decodedType: decoded.clientMessage.decodedType || null,
          isDecoded: decoded.clientMessage.isDecoded || false
        });
        break;

      case 'upgrade_client':
        anyFields.push({
          fieldName: 'upgradedClientState',
          typeUrl: decoded.upgradedClientState.typeUrl,
          decodedType: decoded.upgradedClientState.decodedType || null,
          isDecoded: decoded.upgradedClientState.isDecoded || false
        });
        anyFields.push({
          fieldName: 'upgradedConsensusState',
          typeUrl: decoded.upgradedConsensusState.typeUrl,
          decodedType: decoded.upgradedConsensusState.decodedType || null,
          isDecoded: decoded.upgradedConsensusState.isDecoded || false
        });
        break;

      case 'submit_misbehaviour':
        anyFields.push({
          fieldName: 'misbehaviour',
          typeUrl: decoded.misbehaviour.typeUrl,
          decodedType: decoded.misbehaviour.decodedType || null,
          isDecoded: decoded.misbehaviour.isDecoded || false
        });
        break;

      case 'connection_open_try':
        anyFields.push({
          fieldName: 'clientStateOnA',
          typeUrl: decoded.clientStateOnA.typeUrl,
          decodedType: decoded.clientStateOnA.decodedType || null,
          isDecoded: decoded.clientStateOnA.isDecoded || false
        });
        break;

      case 'connection_open_ack':
        anyFields.push({
          fieldName: 'clientStateOnB',
          typeUrl: decoded.clientStateOnB.typeUrl,
          decodedType: decoded.clientStateOnB.decodedType || null,
          isDecoded: decoded.clientStateOnB.isDecoded || false
        });
        break;

      default:
        // No protobuf Any fields in this message type
        break;
    }

    return anyFields;
  }
}

export type { DecodedNestedMessage, ProtobufAny, IbcDisplayEvent };

