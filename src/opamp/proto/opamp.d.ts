import * as $protobuf from 'protobufjs';
import Long = require('long');
/** Namespace opamp. */
export namespace opamp {
  /** Namespace proto. */
  namespace proto {
    /** Properties of an AgentToServer. */
    interface IAgentToServer {
      /** AgentToServer instanceUid */
      instanceUid?: Uint8Array | null;

      /** AgentToServer sequenceNum */
      sequenceNum?: number | Long | null;

      /** AgentToServer agentDescription */
      agentDescription?: opamp.proto.IAgentDescription | null;

      /** AgentToServer capabilities */
      capabilities?: number | Long | null;

      /** AgentToServer health */
      health?: opamp.proto.IComponentHealth | null;

      /** AgentToServer effectiveConfig */
      effectiveConfig?: opamp.proto.IEffectiveConfig | null;

      /** AgentToServer remoteConfigStatus */
      remoteConfigStatus?: opamp.proto.IRemoteConfigStatus | null;

      /** AgentToServer packageStatuses */
      packageStatuses?: opamp.proto.IPackageStatuses | null;

      /** AgentToServer agentDisconnect */
      agentDisconnect?: opamp.proto.IAgentDisconnect | null;

      /** AgentToServer flags */
      flags?: number | Long | null;

      /** AgentToServer connectionSettingsRequest */
      connectionSettingsRequest?: opamp.proto.IConnectionSettingsRequest | null;

      /** AgentToServer customCapabilities */
      customCapabilities?: opamp.proto.ICustomCapabilities | null;

      /** AgentToServer customMessage */
      customMessage?: opamp.proto.ICustomMessage | null;

      /** AgentToServer availableComponents */
      availableComponents?: opamp.proto.IAvailableComponents | null;

      /** AgentToServer connectionSettingsStatus */
      connectionSettingsStatus?: opamp.proto.IConnectionSettingsStatus | null;
    }

    /** Represents an AgentToServer. */
    class AgentToServer implements IAgentToServer {
      /**
       * Constructs a new AgentToServer.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IAgentToServer);

      /** AgentToServer instanceUid. */
      public instanceUid: Uint8Array;

      /** AgentToServer sequenceNum. */
      public sequenceNum: number | Long;

      /** AgentToServer agentDescription. */
      public agentDescription?: opamp.proto.IAgentDescription | null;

      /** AgentToServer capabilities. */
      public capabilities: number | Long;

      /** AgentToServer health. */
      public health?: opamp.proto.IComponentHealth | null;

      /** AgentToServer effectiveConfig. */
      public effectiveConfig?: opamp.proto.IEffectiveConfig | null;

      /** AgentToServer remoteConfigStatus. */
      public remoteConfigStatus?: opamp.proto.IRemoteConfigStatus | null;

      /** AgentToServer packageStatuses. */
      public packageStatuses?: opamp.proto.IPackageStatuses | null;

      /** AgentToServer agentDisconnect. */
      public agentDisconnect?: opamp.proto.IAgentDisconnect | null;

      /** AgentToServer flags. */
      public flags: number | Long;

      /** AgentToServer connectionSettingsRequest. */
      public connectionSettingsRequest?: opamp.proto.IConnectionSettingsRequest | null;

      /** AgentToServer customCapabilities. */
      public customCapabilities?: opamp.proto.ICustomCapabilities | null;

      /** AgentToServer customMessage. */
      public customMessage?: opamp.proto.ICustomMessage | null;

      /** AgentToServer availableComponents. */
      public availableComponents?: opamp.proto.IAvailableComponents | null;

      /** AgentToServer connectionSettingsStatus. */
      public connectionSettingsStatus?: opamp.proto.IConnectionSettingsStatus | null;

      /**
       * Creates a new AgentToServer instance using the specified properties.
       * @param [properties] Properties to set
       * @returns AgentToServer instance
       */
      public static create(
        properties?: opamp.proto.IAgentToServer
      ): opamp.proto.AgentToServer;

      /**
       * Encodes the specified AgentToServer message. Does not implicitly {@link opamp.proto.AgentToServer.verify|verify} messages.
       * @param message AgentToServer message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IAgentToServer,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified AgentToServer message, length delimited. Does not implicitly {@link opamp.proto.AgentToServer.verify|verify} messages.
       * @param message AgentToServer message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IAgentToServer,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes an AgentToServer message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns AgentToServer
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.AgentToServer;

      /**
       * Decodes an AgentToServer message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns AgentToServer
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.AgentToServer;

      /**
       * Verifies an AgentToServer message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates an AgentToServer message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns AgentToServer
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.AgentToServer;

      /**
       * Creates a plain object from an AgentToServer message. Also converts values to other types if specified.
       * @param message AgentToServer
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.AgentToServer,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this AgentToServer to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for AgentToServer
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** AgentToServerFlags enum. */
    enum AgentToServerFlags {
      AgentToServerFlags_Unspecified = 0,
      AgentToServerFlags_RequestInstanceUid = 1,
    }

    /** Properties of an AgentDisconnect. */
    interface IAgentDisconnect {}

    /** Represents an AgentDisconnect. */
    class AgentDisconnect implements IAgentDisconnect {
      /**
       * Constructs a new AgentDisconnect.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IAgentDisconnect);

      /**
       * Creates a new AgentDisconnect instance using the specified properties.
       * @param [properties] Properties to set
       * @returns AgentDisconnect instance
       */
      public static create(
        properties?: opamp.proto.IAgentDisconnect
      ): opamp.proto.AgentDisconnect;

      /**
       * Encodes the specified AgentDisconnect message. Does not implicitly {@link opamp.proto.AgentDisconnect.verify|verify} messages.
       * @param message AgentDisconnect message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IAgentDisconnect,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified AgentDisconnect message, length delimited. Does not implicitly {@link opamp.proto.AgentDisconnect.verify|verify} messages.
       * @param message AgentDisconnect message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IAgentDisconnect,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes an AgentDisconnect message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns AgentDisconnect
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.AgentDisconnect;

      /**
       * Decodes an AgentDisconnect message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns AgentDisconnect
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.AgentDisconnect;

      /**
       * Verifies an AgentDisconnect message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates an AgentDisconnect message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns AgentDisconnect
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.AgentDisconnect;

      /**
       * Creates a plain object from an AgentDisconnect message. Also converts values to other types if specified.
       * @param message AgentDisconnect
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.AgentDisconnect,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this AgentDisconnect to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for AgentDisconnect
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ConnectionSettingsRequest. */
    interface IConnectionSettingsRequest {
      /** ConnectionSettingsRequest opamp */
      opamp?: opamp.proto.IOpAMPConnectionSettingsRequest | null;
    }

    /** Represents a ConnectionSettingsRequest. */
    class ConnectionSettingsRequest implements IConnectionSettingsRequest {
      /**
       * Constructs a new ConnectionSettingsRequest.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IConnectionSettingsRequest);

      /** ConnectionSettingsRequest opamp. */
      public opamp?: opamp.proto.IOpAMPConnectionSettingsRequest | null;

      /**
       * Creates a new ConnectionSettingsRequest instance using the specified properties.
       * @param [properties] Properties to set
       * @returns ConnectionSettingsRequest instance
       */
      public static create(
        properties?: opamp.proto.IConnectionSettingsRequest
      ): opamp.proto.ConnectionSettingsRequest;

      /**
       * Encodes the specified ConnectionSettingsRequest message. Does not implicitly {@link opamp.proto.ConnectionSettingsRequest.verify|verify} messages.
       * @param message ConnectionSettingsRequest message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IConnectionSettingsRequest,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified ConnectionSettingsRequest message, length delimited. Does not implicitly {@link opamp.proto.ConnectionSettingsRequest.verify|verify} messages.
       * @param message ConnectionSettingsRequest message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IConnectionSettingsRequest,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a ConnectionSettingsRequest message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns ConnectionSettingsRequest
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.ConnectionSettingsRequest;

      /**
       * Decodes a ConnectionSettingsRequest message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns ConnectionSettingsRequest
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.ConnectionSettingsRequest;

      /**
       * Verifies a ConnectionSettingsRequest message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a ConnectionSettingsRequest message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns ConnectionSettingsRequest
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.ConnectionSettingsRequest;

      /**
       * Creates a plain object from a ConnectionSettingsRequest message. Also converts values to other types if specified.
       * @param message ConnectionSettingsRequest
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.ConnectionSettingsRequest,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this ConnectionSettingsRequest to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for ConnectionSettingsRequest
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an OpAMPConnectionSettingsRequest. */
    interface IOpAMPConnectionSettingsRequest {
      /** OpAMPConnectionSettingsRequest certificateRequest */
      certificateRequest?: opamp.proto.ICertificateRequest | null;
    }

    /** Represents an OpAMPConnectionSettingsRequest. */
    class OpAMPConnectionSettingsRequest implements IOpAMPConnectionSettingsRequest {
      /**
       * Constructs a new OpAMPConnectionSettingsRequest.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IOpAMPConnectionSettingsRequest);

      /** OpAMPConnectionSettingsRequest certificateRequest. */
      public certificateRequest?: opamp.proto.ICertificateRequest | null;

      /**
       * Creates a new OpAMPConnectionSettingsRequest instance using the specified properties.
       * @param [properties] Properties to set
       * @returns OpAMPConnectionSettingsRequest instance
       */
      public static create(
        properties?: opamp.proto.IOpAMPConnectionSettingsRequest
      ): opamp.proto.OpAMPConnectionSettingsRequest;

      /**
       * Encodes the specified OpAMPConnectionSettingsRequest message. Does not implicitly {@link opamp.proto.OpAMPConnectionSettingsRequest.verify|verify} messages.
       * @param message OpAMPConnectionSettingsRequest message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IOpAMPConnectionSettingsRequest,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified OpAMPConnectionSettingsRequest message, length delimited. Does not implicitly {@link opamp.proto.OpAMPConnectionSettingsRequest.verify|verify} messages.
       * @param message OpAMPConnectionSettingsRequest message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IOpAMPConnectionSettingsRequest,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes an OpAMPConnectionSettingsRequest message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns OpAMPConnectionSettingsRequest
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.OpAMPConnectionSettingsRequest;

      /**
       * Decodes an OpAMPConnectionSettingsRequest message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns OpAMPConnectionSettingsRequest
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.OpAMPConnectionSettingsRequest;

      /**
       * Verifies an OpAMPConnectionSettingsRequest message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates an OpAMPConnectionSettingsRequest message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns OpAMPConnectionSettingsRequest
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.OpAMPConnectionSettingsRequest;

      /**
       * Creates a plain object from an OpAMPConnectionSettingsRequest message. Also converts values to other types if specified.
       * @param message OpAMPConnectionSettingsRequest
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.OpAMPConnectionSettingsRequest,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this OpAMPConnectionSettingsRequest to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for OpAMPConnectionSettingsRequest
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CertificateRequest. */
    interface ICertificateRequest {
      /** CertificateRequest csr */
      csr?: Uint8Array | null;
    }

    /** Represents a CertificateRequest. */
    class CertificateRequest implements ICertificateRequest {
      /**
       * Constructs a new CertificateRequest.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.ICertificateRequest);

      /** CertificateRequest csr. */
      public csr: Uint8Array;

      /**
       * Creates a new CertificateRequest instance using the specified properties.
       * @param [properties] Properties to set
       * @returns CertificateRequest instance
       */
      public static create(
        properties?: opamp.proto.ICertificateRequest
      ): opamp.proto.CertificateRequest;

      /**
       * Encodes the specified CertificateRequest message. Does not implicitly {@link opamp.proto.CertificateRequest.verify|verify} messages.
       * @param message CertificateRequest message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.ICertificateRequest,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified CertificateRequest message, length delimited. Does not implicitly {@link opamp.proto.CertificateRequest.verify|verify} messages.
       * @param message CertificateRequest message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.ICertificateRequest,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a CertificateRequest message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns CertificateRequest
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.CertificateRequest;

      /**
       * Decodes a CertificateRequest message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns CertificateRequest
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.CertificateRequest;

      /**
       * Verifies a CertificateRequest message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a CertificateRequest message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns CertificateRequest
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.CertificateRequest;

      /**
       * Creates a plain object from a CertificateRequest message. Also converts values to other types if specified.
       * @param message CertificateRequest
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.CertificateRequest,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this CertificateRequest to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for CertificateRequest
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an AvailableComponents. */
    interface IAvailableComponents {
      /** AvailableComponents components */
      components?: { [k: string]: opamp.proto.IComponentDetails } | null;

      /** AvailableComponents hash */
      hash?: Uint8Array | null;
    }

    /** Represents an AvailableComponents. */
    class AvailableComponents implements IAvailableComponents {
      /**
       * Constructs a new AvailableComponents.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IAvailableComponents);

      /** AvailableComponents components. */
      public components: { [k: string]: opamp.proto.IComponentDetails };

      /** AvailableComponents hash. */
      public hash: Uint8Array;

      /**
       * Creates a new AvailableComponents instance using the specified properties.
       * @param [properties] Properties to set
       * @returns AvailableComponents instance
       */
      public static create(
        properties?: opamp.proto.IAvailableComponents
      ): opamp.proto.AvailableComponents;

      /**
       * Encodes the specified AvailableComponents message. Does not implicitly {@link opamp.proto.AvailableComponents.verify|verify} messages.
       * @param message AvailableComponents message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IAvailableComponents,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified AvailableComponents message, length delimited. Does not implicitly {@link opamp.proto.AvailableComponents.verify|verify} messages.
       * @param message AvailableComponents message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IAvailableComponents,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes an AvailableComponents message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns AvailableComponents
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.AvailableComponents;

      /**
       * Decodes an AvailableComponents message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns AvailableComponents
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.AvailableComponents;

      /**
       * Verifies an AvailableComponents message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates an AvailableComponents message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns AvailableComponents
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.AvailableComponents;

      /**
       * Creates a plain object from an AvailableComponents message. Also converts values to other types if specified.
       * @param message AvailableComponents
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.AvailableComponents,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this AvailableComponents to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for AvailableComponents
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ComponentDetails. */
    interface IComponentDetails {
      /** ComponentDetails metadata */
      metadata?: opamp.proto.IKeyValue[] | null;

      /** ComponentDetails subComponentMap */
      subComponentMap?: { [k: string]: opamp.proto.IComponentDetails } | null;
    }

    /** Represents a ComponentDetails. */
    class ComponentDetails implements IComponentDetails {
      /**
       * Constructs a new ComponentDetails.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IComponentDetails);

      /** ComponentDetails metadata. */
      public metadata: opamp.proto.IKeyValue[];

      /** ComponentDetails subComponentMap. */
      public subComponentMap: { [k: string]: opamp.proto.IComponentDetails };

      /**
       * Creates a new ComponentDetails instance using the specified properties.
       * @param [properties] Properties to set
       * @returns ComponentDetails instance
       */
      public static create(
        properties?: opamp.proto.IComponentDetails
      ): opamp.proto.ComponentDetails;

      /**
       * Encodes the specified ComponentDetails message. Does not implicitly {@link opamp.proto.ComponentDetails.verify|verify} messages.
       * @param message ComponentDetails message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IComponentDetails,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified ComponentDetails message, length delimited. Does not implicitly {@link opamp.proto.ComponentDetails.verify|verify} messages.
       * @param message ComponentDetails message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IComponentDetails,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a ComponentDetails message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns ComponentDetails
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.ComponentDetails;

      /**
       * Decodes a ComponentDetails message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns ComponentDetails
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.ComponentDetails;

      /**
       * Verifies a ComponentDetails message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a ComponentDetails message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns ComponentDetails
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.ComponentDetails;

      /**
       * Creates a plain object from a ComponentDetails message. Also converts values to other types if specified.
       * @param message ComponentDetails
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.ComponentDetails,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this ComponentDetails to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for ComponentDetails
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ServerToAgent. */
    interface IServerToAgent {
      /** ServerToAgent instanceUid */
      instanceUid?: Uint8Array | null;

      /** ServerToAgent errorResponse */
      errorResponse?: opamp.proto.IServerErrorResponse | null;

      /** ServerToAgent remoteConfig */
      remoteConfig?: opamp.proto.IAgentRemoteConfig | null;

      /** ServerToAgent connectionSettings */
      connectionSettings?: opamp.proto.IConnectionSettingsOffers | null;

      /** ServerToAgent packagesAvailable */
      packagesAvailable?: opamp.proto.IPackagesAvailable | null;

      /** ServerToAgent flags */
      flags?: number | Long | null;

      /** ServerToAgent capabilities */
      capabilities?: number | Long | null;

      /** ServerToAgent agentIdentification */
      agentIdentification?: opamp.proto.IAgentIdentification | null;

      /** ServerToAgent command */
      command?: opamp.proto.IServerToAgentCommand | null;

      /** ServerToAgent customCapabilities */
      customCapabilities?: opamp.proto.ICustomCapabilities | null;

      /** ServerToAgent customMessage */
      customMessage?: opamp.proto.ICustomMessage | null;
    }

    /** Represents a ServerToAgent. */
    class ServerToAgent implements IServerToAgent {
      /**
       * Constructs a new ServerToAgent.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IServerToAgent);

      /** ServerToAgent instanceUid. */
      public instanceUid: Uint8Array;

      /** ServerToAgent errorResponse. */
      public errorResponse?: opamp.proto.IServerErrorResponse | null;

      /** ServerToAgent remoteConfig. */
      public remoteConfig?: opamp.proto.IAgentRemoteConfig | null;

      /** ServerToAgent connectionSettings. */
      public connectionSettings?: opamp.proto.IConnectionSettingsOffers | null;

      /** ServerToAgent packagesAvailable. */
      public packagesAvailable?: opamp.proto.IPackagesAvailable | null;

      /** ServerToAgent flags. */
      public flags: number | Long;

      /** ServerToAgent capabilities. */
      public capabilities: number | Long;

      /** ServerToAgent agentIdentification. */
      public agentIdentification?: opamp.proto.IAgentIdentification | null;

      /** ServerToAgent command. */
      public command?: opamp.proto.IServerToAgentCommand | null;

      /** ServerToAgent customCapabilities. */
      public customCapabilities?: opamp.proto.ICustomCapabilities | null;

      /** ServerToAgent customMessage. */
      public customMessage?: opamp.proto.ICustomMessage | null;

      /**
       * Creates a new ServerToAgent instance using the specified properties.
       * @param [properties] Properties to set
       * @returns ServerToAgent instance
       */
      public static create(
        properties?: opamp.proto.IServerToAgent
      ): opamp.proto.ServerToAgent;

      /**
       * Encodes the specified ServerToAgent message. Does not implicitly {@link opamp.proto.ServerToAgent.verify|verify} messages.
       * @param message ServerToAgent message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IServerToAgent,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified ServerToAgent message, length delimited. Does not implicitly {@link opamp.proto.ServerToAgent.verify|verify} messages.
       * @param message ServerToAgent message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IServerToAgent,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a ServerToAgent message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns ServerToAgent
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.ServerToAgent;

      /**
       * Decodes a ServerToAgent message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns ServerToAgent
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.ServerToAgent;

      /**
       * Verifies a ServerToAgent message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a ServerToAgent message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns ServerToAgent
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.ServerToAgent;

      /**
       * Creates a plain object from a ServerToAgent message. Also converts values to other types if specified.
       * @param message ServerToAgent
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.ServerToAgent,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this ServerToAgent to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for ServerToAgent
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** ServerToAgentFlags enum. */
    enum ServerToAgentFlags {
      ServerToAgentFlags_Unspecified = 0,
      ServerToAgentFlags_ReportFullState = 1,
      ServerToAgentFlags_ReportAvailableComponents = 2,
    }

    /** ServerCapabilities enum. */
    enum ServerCapabilities {
      ServerCapabilities_Unspecified = 0,
      ServerCapabilities_AcceptsStatus = 1,
      ServerCapabilities_OffersRemoteConfig = 2,
      ServerCapabilities_AcceptsEffectiveConfig = 4,
      ServerCapabilities_OffersPackages = 8,
      ServerCapabilities_AcceptsPackagesStatus = 16,
      ServerCapabilities_OffersConnectionSettings = 32,
      ServerCapabilities_AcceptsConnectionSettingsRequest = 64,
    }

    /** Properties of an OpAMPConnectionSettings. */
    interface IOpAMPConnectionSettings {
      /** OpAMPConnectionSettings destinationEndpoint */
      destinationEndpoint?: string | null;

      /** OpAMPConnectionSettings headers */
      headers?: opamp.proto.IHeaders | null;

      /** OpAMPConnectionSettings certificate */
      certificate?: opamp.proto.ITLSCertificate | null;

      /** OpAMPConnectionSettings heartbeatIntervalSeconds */
      heartbeatIntervalSeconds?: number | Long | null;

      /** OpAMPConnectionSettings tls */
      tls?: opamp.proto.ITLSConnectionSettings | null;

      /** OpAMPConnectionSettings proxy */
      proxy?: opamp.proto.IProxyConnectionSettings | null;
    }

    /** Represents an OpAMPConnectionSettings. */
    class OpAMPConnectionSettings implements IOpAMPConnectionSettings {
      /**
       * Constructs a new OpAMPConnectionSettings.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IOpAMPConnectionSettings);

      /** OpAMPConnectionSettings destinationEndpoint. */
      public destinationEndpoint: string;

      /** OpAMPConnectionSettings headers. */
      public headers?: opamp.proto.IHeaders | null;

      /** OpAMPConnectionSettings certificate. */
      public certificate?: opamp.proto.ITLSCertificate | null;

      /** OpAMPConnectionSettings heartbeatIntervalSeconds. */
      public heartbeatIntervalSeconds: number | Long;

      /** OpAMPConnectionSettings tls. */
      public tls?: opamp.proto.ITLSConnectionSettings | null;

      /** OpAMPConnectionSettings proxy. */
      public proxy?: opamp.proto.IProxyConnectionSettings | null;

      /**
       * Creates a new OpAMPConnectionSettings instance using the specified properties.
       * @param [properties] Properties to set
       * @returns OpAMPConnectionSettings instance
       */
      public static create(
        properties?: opamp.proto.IOpAMPConnectionSettings
      ): opamp.proto.OpAMPConnectionSettings;

      /**
       * Encodes the specified OpAMPConnectionSettings message. Does not implicitly {@link opamp.proto.OpAMPConnectionSettings.verify|verify} messages.
       * @param message OpAMPConnectionSettings message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IOpAMPConnectionSettings,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified OpAMPConnectionSettings message, length delimited. Does not implicitly {@link opamp.proto.OpAMPConnectionSettings.verify|verify} messages.
       * @param message OpAMPConnectionSettings message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IOpAMPConnectionSettings,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes an OpAMPConnectionSettings message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns OpAMPConnectionSettings
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.OpAMPConnectionSettings;

      /**
       * Decodes an OpAMPConnectionSettings message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns OpAMPConnectionSettings
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.OpAMPConnectionSettings;

      /**
       * Verifies an OpAMPConnectionSettings message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates an OpAMPConnectionSettings message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns OpAMPConnectionSettings
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.OpAMPConnectionSettings;

      /**
       * Creates a plain object from an OpAMPConnectionSettings message. Also converts values to other types if specified.
       * @param message OpAMPConnectionSettings
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.OpAMPConnectionSettings,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this OpAMPConnectionSettings to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for OpAMPConnectionSettings
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a TelemetryConnectionSettings. */
    interface ITelemetryConnectionSettings {
      /** TelemetryConnectionSettings destinationEndpoint */
      destinationEndpoint?: string | null;

      /** TelemetryConnectionSettings headers */
      headers?: opamp.proto.IHeaders | null;

      /** TelemetryConnectionSettings certificate */
      certificate?: opamp.proto.ITLSCertificate | null;

      /** TelemetryConnectionSettings tls */
      tls?: opamp.proto.ITLSConnectionSettings | null;

      /** TelemetryConnectionSettings proxy */
      proxy?: opamp.proto.IProxyConnectionSettings | null;
    }

    /** Represents a TelemetryConnectionSettings. */
    class TelemetryConnectionSettings implements ITelemetryConnectionSettings {
      /**
       * Constructs a new TelemetryConnectionSettings.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.ITelemetryConnectionSettings);

      /** TelemetryConnectionSettings destinationEndpoint. */
      public destinationEndpoint: string;

      /** TelemetryConnectionSettings headers. */
      public headers?: opamp.proto.IHeaders | null;

      /** TelemetryConnectionSettings certificate. */
      public certificate?: opamp.proto.ITLSCertificate | null;

      /** TelemetryConnectionSettings tls. */
      public tls?: opamp.proto.ITLSConnectionSettings | null;

      /** TelemetryConnectionSettings proxy. */
      public proxy?: opamp.proto.IProxyConnectionSettings | null;

      /**
       * Creates a new TelemetryConnectionSettings instance using the specified properties.
       * @param [properties] Properties to set
       * @returns TelemetryConnectionSettings instance
       */
      public static create(
        properties?: opamp.proto.ITelemetryConnectionSettings
      ): opamp.proto.TelemetryConnectionSettings;

      /**
       * Encodes the specified TelemetryConnectionSettings message. Does not implicitly {@link opamp.proto.TelemetryConnectionSettings.verify|verify} messages.
       * @param message TelemetryConnectionSettings message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.ITelemetryConnectionSettings,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified TelemetryConnectionSettings message, length delimited. Does not implicitly {@link opamp.proto.TelemetryConnectionSettings.verify|verify} messages.
       * @param message TelemetryConnectionSettings message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.ITelemetryConnectionSettings,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a TelemetryConnectionSettings message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns TelemetryConnectionSettings
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.TelemetryConnectionSettings;

      /**
       * Decodes a TelemetryConnectionSettings message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns TelemetryConnectionSettings
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.TelemetryConnectionSettings;

      /**
       * Verifies a TelemetryConnectionSettings message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a TelemetryConnectionSettings message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns TelemetryConnectionSettings
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.TelemetryConnectionSettings;

      /**
       * Creates a plain object from a TelemetryConnectionSettings message. Also converts values to other types if specified.
       * @param message TelemetryConnectionSettings
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.TelemetryConnectionSettings,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this TelemetryConnectionSettings to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for TelemetryConnectionSettings
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an OtherConnectionSettings. */
    interface IOtherConnectionSettings {
      /** OtherConnectionSettings destinationEndpoint */
      destinationEndpoint?: string | null;

      /** OtherConnectionSettings headers */
      headers?: opamp.proto.IHeaders | null;

      /** OtherConnectionSettings certificate */
      certificate?: opamp.proto.ITLSCertificate | null;

      /** OtherConnectionSettings otherSettings */
      otherSettings?: { [k: string]: string } | null;

      /** OtherConnectionSettings tls */
      tls?: opamp.proto.ITLSConnectionSettings | null;

      /** OtherConnectionSettings proxy */
      proxy?: opamp.proto.IProxyConnectionSettings | null;
    }

    /** Represents an OtherConnectionSettings. */
    class OtherConnectionSettings implements IOtherConnectionSettings {
      /**
       * Constructs a new OtherConnectionSettings.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IOtherConnectionSettings);

      /** OtherConnectionSettings destinationEndpoint. */
      public destinationEndpoint: string;

      /** OtherConnectionSettings headers. */
      public headers?: opamp.proto.IHeaders | null;

      /** OtherConnectionSettings certificate. */
      public certificate?: opamp.proto.ITLSCertificate | null;

      /** OtherConnectionSettings otherSettings. */
      public otherSettings: { [k: string]: string };

      /** OtherConnectionSettings tls. */
      public tls?: opamp.proto.ITLSConnectionSettings | null;

      /** OtherConnectionSettings proxy. */
      public proxy?: opamp.proto.IProxyConnectionSettings | null;

      /**
       * Creates a new OtherConnectionSettings instance using the specified properties.
       * @param [properties] Properties to set
       * @returns OtherConnectionSettings instance
       */
      public static create(
        properties?: opamp.proto.IOtherConnectionSettings
      ): opamp.proto.OtherConnectionSettings;

      /**
       * Encodes the specified OtherConnectionSettings message. Does not implicitly {@link opamp.proto.OtherConnectionSettings.verify|verify} messages.
       * @param message OtherConnectionSettings message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IOtherConnectionSettings,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified OtherConnectionSettings message, length delimited. Does not implicitly {@link opamp.proto.OtherConnectionSettings.verify|verify} messages.
       * @param message OtherConnectionSettings message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IOtherConnectionSettings,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes an OtherConnectionSettings message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns OtherConnectionSettings
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.OtherConnectionSettings;

      /**
       * Decodes an OtherConnectionSettings message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns OtherConnectionSettings
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.OtherConnectionSettings;

      /**
       * Verifies an OtherConnectionSettings message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates an OtherConnectionSettings message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns OtherConnectionSettings
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.OtherConnectionSettings;

      /**
       * Creates a plain object from an OtherConnectionSettings message. Also converts values to other types if specified.
       * @param message OtherConnectionSettings
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.OtherConnectionSettings,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this OtherConnectionSettings to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for OtherConnectionSettings
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a TLSConnectionSettings. */
    interface ITLSConnectionSettings {
      /** TLSConnectionSettings caPemContents */
      caPemContents?: string | null;

      /** TLSConnectionSettings includeSystemCaCertsPool */
      includeSystemCaCertsPool?: boolean | null;

      /** TLSConnectionSettings insecureSkipVerify */
      insecureSkipVerify?: boolean | null;

      /** TLSConnectionSettings minVersion */
      minVersion?: string | null;

      /** TLSConnectionSettings maxVersion */
      maxVersion?: string | null;

      /** TLSConnectionSettings cipherSuites */
      cipherSuites?: string[] | null;
    }

    /** Represents a TLSConnectionSettings. */
    class TLSConnectionSettings implements ITLSConnectionSettings {
      /**
       * Constructs a new TLSConnectionSettings.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.ITLSConnectionSettings);

      /** TLSConnectionSettings caPemContents. */
      public caPemContents: string;

      /** TLSConnectionSettings includeSystemCaCertsPool. */
      public includeSystemCaCertsPool: boolean;

      /** TLSConnectionSettings insecureSkipVerify. */
      public insecureSkipVerify: boolean;

      /** TLSConnectionSettings minVersion. */
      public minVersion: string;

      /** TLSConnectionSettings maxVersion. */
      public maxVersion: string;

      /** TLSConnectionSettings cipherSuites. */
      public cipherSuites: string[];

      /**
       * Creates a new TLSConnectionSettings instance using the specified properties.
       * @param [properties] Properties to set
       * @returns TLSConnectionSettings instance
       */
      public static create(
        properties?: opamp.proto.ITLSConnectionSettings
      ): opamp.proto.TLSConnectionSettings;

      /**
       * Encodes the specified TLSConnectionSettings message. Does not implicitly {@link opamp.proto.TLSConnectionSettings.verify|verify} messages.
       * @param message TLSConnectionSettings message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.ITLSConnectionSettings,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified TLSConnectionSettings message, length delimited. Does not implicitly {@link opamp.proto.TLSConnectionSettings.verify|verify} messages.
       * @param message TLSConnectionSettings message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.ITLSConnectionSettings,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a TLSConnectionSettings message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns TLSConnectionSettings
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.TLSConnectionSettings;

      /**
       * Decodes a TLSConnectionSettings message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns TLSConnectionSettings
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.TLSConnectionSettings;

      /**
       * Verifies a TLSConnectionSettings message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a TLSConnectionSettings message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns TLSConnectionSettings
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.TLSConnectionSettings;

      /**
       * Creates a plain object from a TLSConnectionSettings message. Also converts values to other types if specified.
       * @param message TLSConnectionSettings
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.TLSConnectionSettings,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this TLSConnectionSettings to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for TLSConnectionSettings
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ProxyConnectionSettings. */
    interface IProxyConnectionSettings {
      /** ProxyConnectionSettings url */
      url?: string | null;

      /** ProxyConnectionSettings connectHeaders */
      connectHeaders?: opamp.proto.IHeaders | null;
    }

    /** Represents a ProxyConnectionSettings. */
    class ProxyConnectionSettings implements IProxyConnectionSettings {
      /**
       * Constructs a new ProxyConnectionSettings.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IProxyConnectionSettings);

      /** ProxyConnectionSettings url. */
      public url: string;

      /** ProxyConnectionSettings connectHeaders. */
      public connectHeaders?: opamp.proto.IHeaders | null;

      /**
       * Creates a new ProxyConnectionSettings instance using the specified properties.
       * @param [properties] Properties to set
       * @returns ProxyConnectionSettings instance
       */
      public static create(
        properties?: opamp.proto.IProxyConnectionSettings
      ): opamp.proto.ProxyConnectionSettings;

      /**
       * Encodes the specified ProxyConnectionSettings message. Does not implicitly {@link opamp.proto.ProxyConnectionSettings.verify|verify} messages.
       * @param message ProxyConnectionSettings message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IProxyConnectionSettings,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified ProxyConnectionSettings message, length delimited. Does not implicitly {@link opamp.proto.ProxyConnectionSettings.verify|verify} messages.
       * @param message ProxyConnectionSettings message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IProxyConnectionSettings,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a ProxyConnectionSettings message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns ProxyConnectionSettings
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.ProxyConnectionSettings;

      /**
       * Decodes a ProxyConnectionSettings message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns ProxyConnectionSettings
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.ProxyConnectionSettings;

      /**
       * Verifies a ProxyConnectionSettings message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a ProxyConnectionSettings message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns ProxyConnectionSettings
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.ProxyConnectionSettings;

      /**
       * Creates a plain object from a ProxyConnectionSettings message. Also converts values to other types if specified.
       * @param message ProxyConnectionSettings
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.ProxyConnectionSettings,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this ProxyConnectionSettings to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for ProxyConnectionSettings
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Headers. */
    interface IHeaders {
      /** Headers headers */
      headers?: opamp.proto.IHeader[] | null;
    }

    /** Represents a Headers. */
    class Headers implements IHeaders {
      /**
       * Constructs a new Headers.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IHeaders);

      /** Headers headers. */
      public headers: opamp.proto.IHeader[];

      /**
       * Creates a new Headers instance using the specified properties.
       * @param [properties] Properties to set
       * @returns Headers instance
       */
      public static create(
        properties?: opamp.proto.IHeaders
      ): opamp.proto.Headers;

      /**
       * Encodes the specified Headers message. Does not implicitly {@link opamp.proto.Headers.verify|verify} messages.
       * @param message Headers message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IHeaders,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified Headers message, length delimited. Does not implicitly {@link opamp.proto.Headers.verify|verify} messages.
       * @param message Headers message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IHeaders,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a Headers message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns Headers
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.Headers;

      /**
       * Decodes a Headers message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns Headers
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.Headers;

      /**
       * Verifies a Headers message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a Headers message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns Headers
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.Headers;

      /**
       * Creates a plain object from a Headers message. Also converts values to other types if specified.
       * @param message Headers
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.Headers,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this Headers to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for Headers
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Header. */
    interface IHeader {
      /** Header key */
      key?: string | null;

      /** Header value */
      value?: string | null;
    }

    /** Represents a Header. */
    class Header implements IHeader {
      /**
       * Constructs a new Header.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IHeader);

      /** Header key. */
      public key: string;

      /** Header value. */
      public value: string;

      /**
       * Creates a new Header instance using the specified properties.
       * @param [properties] Properties to set
       * @returns Header instance
       */
      public static create(
        properties?: opamp.proto.IHeader
      ): opamp.proto.Header;

      /**
       * Encodes the specified Header message. Does not implicitly {@link opamp.proto.Header.verify|verify} messages.
       * @param message Header message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IHeader,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified Header message, length delimited. Does not implicitly {@link opamp.proto.Header.verify|verify} messages.
       * @param message Header message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IHeader,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a Header message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns Header
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.Header;

      /**
       * Decodes a Header message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns Header
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.Header;

      /**
       * Verifies a Header message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a Header message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns Header
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.Header;

      /**
       * Creates a plain object from a Header message. Also converts values to other types if specified.
       * @param message Header
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.Header,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this Header to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for Header
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a TLSCertificate. */
    interface ITLSCertificate {
      /** TLSCertificate cert */
      cert?: Uint8Array | null;

      /** TLSCertificate privateKey */
      privateKey?: Uint8Array | null;

      /** TLSCertificate caCert */
      caCert?: Uint8Array | null;
    }

    /** Represents a TLSCertificate. */
    class TLSCertificate implements ITLSCertificate {
      /**
       * Constructs a new TLSCertificate.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.ITLSCertificate);

      /** TLSCertificate cert. */
      public cert: Uint8Array;

      /** TLSCertificate privateKey. */
      public privateKey: Uint8Array;

      /** TLSCertificate caCert. */
      public caCert: Uint8Array;

      /**
       * Creates a new TLSCertificate instance using the specified properties.
       * @param [properties] Properties to set
       * @returns TLSCertificate instance
       */
      public static create(
        properties?: opamp.proto.ITLSCertificate
      ): opamp.proto.TLSCertificate;

      /**
       * Encodes the specified TLSCertificate message. Does not implicitly {@link opamp.proto.TLSCertificate.verify|verify} messages.
       * @param message TLSCertificate message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.ITLSCertificate,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified TLSCertificate message, length delimited. Does not implicitly {@link opamp.proto.TLSCertificate.verify|verify} messages.
       * @param message TLSCertificate message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.ITLSCertificate,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a TLSCertificate message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns TLSCertificate
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.TLSCertificate;

      /**
       * Decodes a TLSCertificate message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns TLSCertificate
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.TLSCertificate;

      /**
       * Verifies a TLSCertificate message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a TLSCertificate message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns TLSCertificate
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.TLSCertificate;

      /**
       * Creates a plain object from a TLSCertificate message. Also converts values to other types if specified.
       * @param message TLSCertificate
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.TLSCertificate,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this TLSCertificate to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for TLSCertificate
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ConnectionSettingsOffers. */
    interface IConnectionSettingsOffers {
      /** ConnectionSettingsOffers hash */
      hash?: Uint8Array | null;

      /** ConnectionSettingsOffers opamp */
      opamp?: opamp.proto.IOpAMPConnectionSettings | null;

      /** ConnectionSettingsOffers ownMetrics */
      ownMetrics?: opamp.proto.ITelemetryConnectionSettings | null;

      /** ConnectionSettingsOffers ownTraces */
      ownTraces?: opamp.proto.ITelemetryConnectionSettings | null;

      /** ConnectionSettingsOffers ownLogs */
      ownLogs?: opamp.proto.ITelemetryConnectionSettings | null;

      /** ConnectionSettingsOffers otherConnections */
      otherConnections?: {
        [k: string]: opamp.proto.IOtherConnectionSettings;
      } | null;
    }

    /** Represents a ConnectionSettingsOffers. */
    class ConnectionSettingsOffers implements IConnectionSettingsOffers {
      /**
       * Constructs a new ConnectionSettingsOffers.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IConnectionSettingsOffers);

      /** ConnectionSettingsOffers hash. */
      public hash: Uint8Array;

      /** ConnectionSettingsOffers opamp. */
      public opamp?: opamp.proto.IOpAMPConnectionSettings | null;

      /** ConnectionSettingsOffers ownMetrics. */
      public ownMetrics?: opamp.proto.ITelemetryConnectionSettings | null;

      /** ConnectionSettingsOffers ownTraces. */
      public ownTraces?: opamp.proto.ITelemetryConnectionSettings | null;

      /** ConnectionSettingsOffers ownLogs. */
      public ownLogs?: opamp.proto.ITelemetryConnectionSettings | null;

      /** ConnectionSettingsOffers otherConnections. */
      public otherConnections: {
        [k: string]: opamp.proto.IOtherConnectionSettings;
      };

      /**
       * Creates a new ConnectionSettingsOffers instance using the specified properties.
       * @param [properties] Properties to set
       * @returns ConnectionSettingsOffers instance
       */
      public static create(
        properties?: opamp.proto.IConnectionSettingsOffers
      ): opamp.proto.ConnectionSettingsOffers;

      /**
       * Encodes the specified ConnectionSettingsOffers message. Does not implicitly {@link opamp.proto.ConnectionSettingsOffers.verify|verify} messages.
       * @param message ConnectionSettingsOffers message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IConnectionSettingsOffers,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified ConnectionSettingsOffers message, length delimited. Does not implicitly {@link opamp.proto.ConnectionSettingsOffers.verify|verify} messages.
       * @param message ConnectionSettingsOffers message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IConnectionSettingsOffers,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a ConnectionSettingsOffers message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns ConnectionSettingsOffers
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.ConnectionSettingsOffers;

      /**
       * Decodes a ConnectionSettingsOffers message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns ConnectionSettingsOffers
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.ConnectionSettingsOffers;

      /**
       * Verifies a ConnectionSettingsOffers message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a ConnectionSettingsOffers message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns ConnectionSettingsOffers
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.ConnectionSettingsOffers;

      /**
       * Creates a plain object from a ConnectionSettingsOffers message. Also converts values to other types if specified.
       * @param message ConnectionSettingsOffers
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.ConnectionSettingsOffers,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this ConnectionSettingsOffers to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for ConnectionSettingsOffers
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a PackagesAvailable. */
    interface IPackagesAvailable {
      /** PackagesAvailable packages */
      packages?: { [k: string]: opamp.proto.IPackageAvailable } | null;

      /** PackagesAvailable allPackagesHash */
      allPackagesHash?: Uint8Array | null;
    }

    /** Represents a PackagesAvailable. */
    class PackagesAvailable implements IPackagesAvailable {
      /**
       * Constructs a new PackagesAvailable.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IPackagesAvailable);

      /** PackagesAvailable packages. */
      public packages: { [k: string]: opamp.proto.IPackageAvailable };

      /** PackagesAvailable allPackagesHash. */
      public allPackagesHash: Uint8Array;

      /**
       * Creates a new PackagesAvailable instance using the specified properties.
       * @param [properties] Properties to set
       * @returns PackagesAvailable instance
       */
      public static create(
        properties?: opamp.proto.IPackagesAvailable
      ): opamp.proto.PackagesAvailable;

      /**
       * Encodes the specified PackagesAvailable message. Does not implicitly {@link opamp.proto.PackagesAvailable.verify|verify} messages.
       * @param message PackagesAvailable message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IPackagesAvailable,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified PackagesAvailable message, length delimited. Does not implicitly {@link opamp.proto.PackagesAvailable.verify|verify} messages.
       * @param message PackagesAvailable message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IPackagesAvailable,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a PackagesAvailable message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns PackagesAvailable
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.PackagesAvailable;

      /**
       * Decodes a PackagesAvailable message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns PackagesAvailable
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.PackagesAvailable;

      /**
       * Verifies a PackagesAvailable message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a PackagesAvailable message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns PackagesAvailable
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.PackagesAvailable;

      /**
       * Creates a plain object from a PackagesAvailable message. Also converts values to other types if specified.
       * @param message PackagesAvailable
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.PackagesAvailable,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this PackagesAvailable to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for PackagesAvailable
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a PackageAvailable. */
    interface IPackageAvailable {
      /** PackageAvailable type */
      type?: opamp.proto.PackageType | null;

      /** PackageAvailable version */
      version?: string | null;

      /** PackageAvailable file */
      file?: opamp.proto.IDownloadableFile | null;

      /** PackageAvailable hash */
      hash?: Uint8Array | null;
    }

    /** Represents a PackageAvailable. */
    class PackageAvailable implements IPackageAvailable {
      /**
       * Constructs a new PackageAvailable.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IPackageAvailable);

      /** PackageAvailable type. */
      public type: opamp.proto.PackageType;

      /** PackageAvailable version. */
      public version: string;

      /** PackageAvailable file. */
      public file?: opamp.proto.IDownloadableFile | null;

      /** PackageAvailable hash. */
      public hash: Uint8Array;

      /**
       * Creates a new PackageAvailable instance using the specified properties.
       * @param [properties] Properties to set
       * @returns PackageAvailable instance
       */
      public static create(
        properties?: opamp.proto.IPackageAvailable
      ): opamp.proto.PackageAvailable;

      /**
       * Encodes the specified PackageAvailable message. Does not implicitly {@link opamp.proto.PackageAvailable.verify|verify} messages.
       * @param message PackageAvailable message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IPackageAvailable,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified PackageAvailable message, length delimited. Does not implicitly {@link opamp.proto.PackageAvailable.verify|verify} messages.
       * @param message PackageAvailable message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IPackageAvailable,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a PackageAvailable message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns PackageAvailable
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.PackageAvailable;

      /**
       * Decodes a PackageAvailable message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns PackageAvailable
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.PackageAvailable;

      /**
       * Verifies a PackageAvailable message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a PackageAvailable message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns PackageAvailable
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.PackageAvailable;

      /**
       * Creates a plain object from a PackageAvailable message. Also converts values to other types if specified.
       * @param message PackageAvailable
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.PackageAvailable,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this PackageAvailable to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for PackageAvailable
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** PackageType enum. */
    enum PackageType {
      PackageType_TopLevel = 0,
      PackageType_Addon = 1,
    }

    /** Properties of a DownloadableFile. */
    interface IDownloadableFile {
      /** DownloadableFile downloadUrl */
      downloadUrl?: string | null;

      /** DownloadableFile contentHash */
      contentHash?: Uint8Array | null;

      /** DownloadableFile signature */
      signature?: Uint8Array | null;

      /** DownloadableFile headers */
      headers?: opamp.proto.IHeaders | null;
    }

    /** Represents a DownloadableFile. */
    class DownloadableFile implements IDownloadableFile {
      /**
       * Constructs a new DownloadableFile.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IDownloadableFile);

      /** DownloadableFile downloadUrl. */
      public downloadUrl: string;

      /** DownloadableFile contentHash. */
      public contentHash: Uint8Array;

      /** DownloadableFile signature. */
      public signature: Uint8Array;

      /** DownloadableFile headers. */
      public headers?: opamp.proto.IHeaders | null;

      /**
       * Creates a new DownloadableFile instance using the specified properties.
       * @param [properties] Properties to set
       * @returns DownloadableFile instance
       */
      public static create(
        properties?: opamp.proto.IDownloadableFile
      ): opamp.proto.DownloadableFile;

      /**
       * Encodes the specified DownloadableFile message. Does not implicitly {@link opamp.proto.DownloadableFile.verify|verify} messages.
       * @param message DownloadableFile message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IDownloadableFile,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified DownloadableFile message, length delimited. Does not implicitly {@link opamp.proto.DownloadableFile.verify|verify} messages.
       * @param message DownloadableFile message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IDownloadableFile,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a DownloadableFile message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns DownloadableFile
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.DownloadableFile;

      /**
       * Decodes a DownloadableFile message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns DownloadableFile
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.DownloadableFile;

      /**
       * Verifies a DownloadableFile message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a DownloadableFile message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns DownloadableFile
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.DownloadableFile;

      /**
       * Creates a plain object from a DownloadableFile message. Also converts values to other types if specified.
       * @param message DownloadableFile
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.DownloadableFile,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this DownloadableFile to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for DownloadableFile
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ServerErrorResponse. */
    interface IServerErrorResponse {
      /** ServerErrorResponse type */
      type?: opamp.proto.ServerErrorResponseType | null;

      /** ServerErrorResponse errorMessage */
      errorMessage?: string | null;

      /** ServerErrorResponse retryInfo */
      retryInfo?: opamp.proto.IRetryInfo | null;
    }

    /** Represents a ServerErrorResponse. */
    class ServerErrorResponse implements IServerErrorResponse {
      /**
       * Constructs a new ServerErrorResponse.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IServerErrorResponse);

      /** ServerErrorResponse type. */
      public type: opamp.proto.ServerErrorResponseType;

      /** ServerErrorResponse errorMessage. */
      public errorMessage: string;

      /** ServerErrorResponse retryInfo. */
      public retryInfo?: opamp.proto.IRetryInfo | null;

      /** ServerErrorResponse Details. */
      public Details?: 'retryInfo';

      /**
       * Creates a new ServerErrorResponse instance using the specified properties.
       * @param [properties] Properties to set
       * @returns ServerErrorResponse instance
       */
      public static create(
        properties?: opamp.proto.IServerErrorResponse
      ): opamp.proto.ServerErrorResponse;

      /**
       * Encodes the specified ServerErrorResponse message. Does not implicitly {@link opamp.proto.ServerErrorResponse.verify|verify} messages.
       * @param message ServerErrorResponse message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IServerErrorResponse,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified ServerErrorResponse message, length delimited. Does not implicitly {@link opamp.proto.ServerErrorResponse.verify|verify} messages.
       * @param message ServerErrorResponse message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IServerErrorResponse,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a ServerErrorResponse message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns ServerErrorResponse
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.ServerErrorResponse;

      /**
       * Decodes a ServerErrorResponse message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns ServerErrorResponse
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.ServerErrorResponse;

      /**
       * Verifies a ServerErrorResponse message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a ServerErrorResponse message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns ServerErrorResponse
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.ServerErrorResponse;

      /**
       * Creates a plain object from a ServerErrorResponse message. Also converts values to other types if specified.
       * @param message ServerErrorResponse
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.ServerErrorResponse,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this ServerErrorResponse to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for ServerErrorResponse
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** ServerErrorResponseType enum. */
    enum ServerErrorResponseType {
      ServerErrorResponseType_Unknown = 0,
      ServerErrorResponseType_BadRequest = 1,
      ServerErrorResponseType_Unavailable = 2,
    }

    /** Properties of a RetryInfo. */
    interface IRetryInfo {
      /** RetryInfo retryAfterNanoseconds */
      retryAfterNanoseconds?: number | Long | null;
    }

    /** Represents a RetryInfo. */
    class RetryInfo implements IRetryInfo {
      /**
       * Constructs a new RetryInfo.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IRetryInfo);

      /** RetryInfo retryAfterNanoseconds. */
      public retryAfterNanoseconds: number | Long;

      /**
       * Creates a new RetryInfo instance using the specified properties.
       * @param [properties] Properties to set
       * @returns RetryInfo instance
       */
      public static create(
        properties?: opamp.proto.IRetryInfo
      ): opamp.proto.RetryInfo;

      /**
       * Encodes the specified RetryInfo message. Does not implicitly {@link opamp.proto.RetryInfo.verify|verify} messages.
       * @param message RetryInfo message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IRetryInfo,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified RetryInfo message, length delimited. Does not implicitly {@link opamp.proto.RetryInfo.verify|verify} messages.
       * @param message RetryInfo message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IRetryInfo,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a RetryInfo message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns RetryInfo
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.RetryInfo;

      /**
       * Decodes a RetryInfo message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns RetryInfo
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.RetryInfo;

      /**
       * Verifies a RetryInfo message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a RetryInfo message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns RetryInfo
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.RetryInfo;

      /**
       * Creates a plain object from a RetryInfo message. Also converts values to other types if specified.
       * @param message RetryInfo
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.RetryInfo,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this RetryInfo to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for RetryInfo
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ServerToAgentCommand. */
    interface IServerToAgentCommand {
      /** ServerToAgentCommand type */
      type?: opamp.proto.CommandType | null;
    }

    /** Represents a ServerToAgentCommand. */
    class ServerToAgentCommand implements IServerToAgentCommand {
      /**
       * Constructs a new ServerToAgentCommand.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IServerToAgentCommand);

      /** ServerToAgentCommand type. */
      public type: opamp.proto.CommandType;

      /**
       * Creates a new ServerToAgentCommand instance using the specified properties.
       * @param [properties] Properties to set
       * @returns ServerToAgentCommand instance
       */
      public static create(
        properties?: opamp.proto.IServerToAgentCommand
      ): opamp.proto.ServerToAgentCommand;

      /**
       * Encodes the specified ServerToAgentCommand message. Does not implicitly {@link opamp.proto.ServerToAgentCommand.verify|verify} messages.
       * @param message ServerToAgentCommand message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IServerToAgentCommand,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified ServerToAgentCommand message, length delimited. Does not implicitly {@link opamp.proto.ServerToAgentCommand.verify|verify} messages.
       * @param message ServerToAgentCommand message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IServerToAgentCommand,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a ServerToAgentCommand message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns ServerToAgentCommand
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.ServerToAgentCommand;

      /**
       * Decodes a ServerToAgentCommand message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns ServerToAgentCommand
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.ServerToAgentCommand;

      /**
       * Verifies a ServerToAgentCommand message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a ServerToAgentCommand message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns ServerToAgentCommand
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.ServerToAgentCommand;

      /**
       * Creates a plain object from a ServerToAgentCommand message. Also converts values to other types if specified.
       * @param message ServerToAgentCommand
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.ServerToAgentCommand,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this ServerToAgentCommand to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for ServerToAgentCommand
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** CommandType enum. */
    enum CommandType {
      CommandType_Restart = 0,
    }

    /** Properties of an AgentDescription. */
    interface IAgentDescription {
      /** AgentDescription identifyingAttributes */
      identifyingAttributes?: opamp.proto.IKeyValue[] | null;

      /** AgentDescription nonIdentifyingAttributes */
      nonIdentifyingAttributes?: opamp.proto.IKeyValue[] | null;
    }

    /** Represents an AgentDescription. */
    class AgentDescription implements IAgentDescription {
      /**
       * Constructs a new AgentDescription.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IAgentDescription);

      /** AgentDescription identifyingAttributes. */
      public identifyingAttributes: opamp.proto.IKeyValue[];

      /** AgentDescription nonIdentifyingAttributes. */
      public nonIdentifyingAttributes: opamp.proto.IKeyValue[];

      /**
       * Creates a new AgentDescription instance using the specified properties.
       * @param [properties] Properties to set
       * @returns AgentDescription instance
       */
      public static create(
        properties?: opamp.proto.IAgentDescription
      ): opamp.proto.AgentDescription;

      /**
       * Encodes the specified AgentDescription message. Does not implicitly {@link opamp.proto.AgentDescription.verify|verify} messages.
       * @param message AgentDescription message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IAgentDescription,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified AgentDescription message, length delimited. Does not implicitly {@link opamp.proto.AgentDescription.verify|verify} messages.
       * @param message AgentDescription message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IAgentDescription,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes an AgentDescription message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns AgentDescription
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.AgentDescription;

      /**
       * Decodes an AgentDescription message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns AgentDescription
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.AgentDescription;

      /**
       * Verifies an AgentDescription message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates an AgentDescription message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns AgentDescription
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.AgentDescription;

      /**
       * Creates a plain object from an AgentDescription message. Also converts values to other types if specified.
       * @param message AgentDescription
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.AgentDescription,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this AgentDescription to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for AgentDescription
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** AgentCapabilities enum. */
    enum AgentCapabilities {
      AgentCapabilities_Unspecified = 0,
      AgentCapabilities_ReportsStatus = 1,
      AgentCapabilities_AcceptsRemoteConfig = 2,
      AgentCapabilities_ReportsEffectiveConfig = 4,
      AgentCapabilities_AcceptsPackages = 8,
      AgentCapabilities_ReportsPackageStatuses = 16,
      AgentCapabilities_ReportsOwnTraces = 32,
      AgentCapabilities_ReportsOwnMetrics = 64,
      AgentCapabilities_ReportsOwnLogs = 128,
      AgentCapabilities_AcceptsOpAMPConnectionSettings = 256,
      AgentCapabilities_AcceptsOtherConnectionSettings = 512,
      AgentCapabilities_AcceptsRestartCommand = 1024,
      AgentCapabilities_ReportsHealth = 2048,
      AgentCapabilities_ReportsRemoteConfig = 4096,
      AgentCapabilities_ReportsHeartbeat = 8192,
      AgentCapabilities_ReportsAvailableComponents = 16384,
      AgentCapabilities_ReportsConnectionSettingsStatus = 32768,
    }

    /** Properties of a ComponentHealth. */
    interface IComponentHealth {
      /** ComponentHealth healthy */
      healthy?: boolean | null;

      /** ComponentHealth startTimeUnixNano */
      startTimeUnixNano?: number | Long | null;

      /** ComponentHealth lastError */
      lastError?: string | null;

      /** ComponentHealth status */
      status?: string | null;

      /** ComponentHealth statusTimeUnixNano */
      statusTimeUnixNano?: number | Long | null;

      /** ComponentHealth componentHealthMap */
      componentHealthMap?: { [k: string]: opamp.proto.IComponentHealth } | null;
    }

    /** Represents a ComponentHealth. */
    class ComponentHealth implements IComponentHealth {
      /**
       * Constructs a new ComponentHealth.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IComponentHealth);

      /** ComponentHealth healthy. */
      public healthy: boolean;

      /** ComponentHealth startTimeUnixNano. */
      public startTimeUnixNano: number | Long;

      /** ComponentHealth lastError. */
      public lastError: string;

      /** ComponentHealth status. */
      public status: string;

      /** ComponentHealth statusTimeUnixNano. */
      public statusTimeUnixNano: number | Long;

      /** ComponentHealth componentHealthMap. */
      public componentHealthMap: { [k: string]: opamp.proto.IComponentHealth };

      /**
       * Creates a new ComponentHealth instance using the specified properties.
       * @param [properties] Properties to set
       * @returns ComponentHealth instance
       */
      public static create(
        properties?: opamp.proto.IComponentHealth
      ): opamp.proto.ComponentHealth;

      /**
       * Encodes the specified ComponentHealth message. Does not implicitly {@link opamp.proto.ComponentHealth.verify|verify} messages.
       * @param message ComponentHealth message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IComponentHealth,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified ComponentHealth message, length delimited. Does not implicitly {@link opamp.proto.ComponentHealth.verify|verify} messages.
       * @param message ComponentHealth message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IComponentHealth,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a ComponentHealth message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns ComponentHealth
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.ComponentHealth;

      /**
       * Decodes a ComponentHealth message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns ComponentHealth
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.ComponentHealth;

      /**
       * Verifies a ComponentHealth message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a ComponentHealth message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns ComponentHealth
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.ComponentHealth;

      /**
       * Creates a plain object from a ComponentHealth message. Also converts values to other types if specified.
       * @param message ComponentHealth
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.ComponentHealth,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this ComponentHealth to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for ComponentHealth
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an EffectiveConfig. */
    interface IEffectiveConfig {
      /** EffectiveConfig configMap */
      configMap?: opamp.proto.IAgentConfigMap | null;
    }

    /** Represents an EffectiveConfig. */
    class EffectiveConfig implements IEffectiveConfig {
      /**
       * Constructs a new EffectiveConfig.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IEffectiveConfig);

      /** EffectiveConfig configMap. */
      public configMap?: opamp.proto.IAgentConfigMap | null;

      /**
       * Creates a new EffectiveConfig instance using the specified properties.
       * @param [properties] Properties to set
       * @returns EffectiveConfig instance
       */
      public static create(
        properties?: opamp.proto.IEffectiveConfig
      ): opamp.proto.EffectiveConfig;

      /**
       * Encodes the specified EffectiveConfig message. Does not implicitly {@link opamp.proto.EffectiveConfig.verify|verify} messages.
       * @param message EffectiveConfig message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IEffectiveConfig,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified EffectiveConfig message, length delimited. Does not implicitly {@link opamp.proto.EffectiveConfig.verify|verify} messages.
       * @param message EffectiveConfig message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IEffectiveConfig,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes an EffectiveConfig message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns EffectiveConfig
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.EffectiveConfig;

      /**
       * Decodes an EffectiveConfig message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns EffectiveConfig
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.EffectiveConfig;

      /**
       * Verifies an EffectiveConfig message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates an EffectiveConfig message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns EffectiveConfig
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.EffectiveConfig;

      /**
       * Creates a plain object from an EffectiveConfig message. Also converts values to other types if specified.
       * @param message EffectiveConfig
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.EffectiveConfig,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this EffectiveConfig to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for EffectiveConfig
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a RemoteConfigStatus. */
    interface IRemoteConfigStatus {
      /** RemoteConfigStatus lastRemoteConfigHash */
      lastRemoteConfigHash?: Uint8Array | null;

      /** RemoteConfigStatus status */
      status?: opamp.proto.RemoteConfigStatuses | null;

      /** RemoteConfigStatus errorMessage */
      errorMessage?: string | null;
    }

    /** Represents a RemoteConfigStatus. */
    class RemoteConfigStatus implements IRemoteConfigStatus {
      /**
       * Constructs a new RemoteConfigStatus.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IRemoteConfigStatus);

      /** RemoteConfigStatus lastRemoteConfigHash. */
      public lastRemoteConfigHash: Uint8Array;

      /** RemoteConfigStatus status. */
      public status: opamp.proto.RemoteConfigStatuses;

      /** RemoteConfigStatus errorMessage. */
      public errorMessage: string;

      /**
       * Creates a new RemoteConfigStatus instance using the specified properties.
       * @param [properties] Properties to set
       * @returns RemoteConfigStatus instance
       */
      public static create(
        properties?: opamp.proto.IRemoteConfigStatus
      ): opamp.proto.RemoteConfigStatus;

      /**
       * Encodes the specified RemoteConfigStatus message. Does not implicitly {@link opamp.proto.RemoteConfigStatus.verify|verify} messages.
       * @param message RemoteConfigStatus message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IRemoteConfigStatus,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified RemoteConfigStatus message, length delimited. Does not implicitly {@link opamp.proto.RemoteConfigStatus.verify|verify} messages.
       * @param message RemoteConfigStatus message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IRemoteConfigStatus,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a RemoteConfigStatus message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns RemoteConfigStatus
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.RemoteConfigStatus;

      /**
       * Decodes a RemoteConfigStatus message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns RemoteConfigStatus
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.RemoteConfigStatus;

      /**
       * Verifies a RemoteConfigStatus message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a RemoteConfigStatus message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns RemoteConfigStatus
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.RemoteConfigStatus;

      /**
       * Creates a plain object from a RemoteConfigStatus message. Also converts values to other types if specified.
       * @param message RemoteConfigStatus
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.RemoteConfigStatus,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this RemoteConfigStatus to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for RemoteConfigStatus
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ConnectionSettingsStatus. */
    interface IConnectionSettingsStatus {
      /** ConnectionSettingsStatus lastConnectionSettingsHash */
      lastConnectionSettingsHash?: Uint8Array | null;

      /** ConnectionSettingsStatus status */
      status?: opamp.proto.ConnectionSettingsStatuses | null;

      /** ConnectionSettingsStatus errorMessage */
      errorMessage?: string | null;
    }

    /** Represents a ConnectionSettingsStatus. */
    class ConnectionSettingsStatus implements IConnectionSettingsStatus {
      /**
       * Constructs a new ConnectionSettingsStatus.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IConnectionSettingsStatus);

      /** ConnectionSettingsStatus lastConnectionSettingsHash. */
      public lastConnectionSettingsHash: Uint8Array;

      /** ConnectionSettingsStatus status. */
      public status: opamp.proto.ConnectionSettingsStatuses;

      /** ConnectionSettingsStatus errorMessage. */
      public errorMessage: string;

      /**
       * Creates a new ConnectionSettingsStatus instance using the specified properties.
       * @param [properties] Properties to set
       * @returns ConnectionSettingsStatus instance
       */
      public static create(
        properties?: opamp.proto.IConnectionSettingsStatus
      ): opamp.proto.ConnectionSettingsStatus;

      /**
       * Encodes the specified ConnectionSettingsStatus message. Does not implicitly {@link opamp.proto.ConnectionSettingsStatus.verify|verify} messages.
       * @param message ConnectionSettingsStatus message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IConnectionSettingsStatus,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified ConnectionSettingsStatus message, length delimited. Does not implicitly {@link opamp.proto.ConnectionSettingsStatus.verify|verify} messages.
       * @param message ConnectionSettingsStatus message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IConnectionSettingsStatus,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a ConnectionSettingsStatus message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns ConnectionSettingsStatus
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.ConnectionSettingsStatus;

      /**
       * Decodes a ConnectionSettingsStatus message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns ConnectionSettingsStatus
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.ConnectionSettingsStatus;

      /**
       * Verifies a ConnectionSettingsStatus message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a ConnectionSettingsStatus message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns ConnectionSettingsStatus
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.ConnectionSettingsStatus;

      /**
       * Creates a plain object from a ConnectionSettingsStatus message. Also converts values to other types if specified.
       * @param message ConnectionSettingsStatus
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.ConnectionSettingsStatus,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this ConnectionSettingsStatus to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for ConnectionSettingsStatus
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** ConnectionSettingsStatuses enum. */
    enum ConnectionSettingsStatuses {
      ConnectionSettingsStatuses_UNSET = 0,
      ConnectionSettingsStatuses_APPLIED = 1,
      ConnectionSettingsStatuses_APPLYING = 2,
      ConnectionSettingsStatuses_FAILED = 3,
    }

    /** RemoteConfigStatuses enum. */
    enum RemoteConfigStatuses {
      RemoteConfigStatuses_UNSET = 0,
      RemoteConfigStatuses_APPLIED = 1,
      RemoteConfigStatuses_APPLYING = 2,
      RemoteConfigStatuses_FAILED = 3,
    }

    /** Properties of a PackageStatuses. */
    interface IPackageStatuses {
      /** PackageStatuses packages */
      packages?: { [k: string]: opamp.proto.IPackageStatus } | null;

      /** PackageStatuses serverProvidedAllPackagesHash */
      serverProvidedAllPackagesHash?: Uint8Array | null;

      /** PackageStatuses errorMessage */
      errorMessage?: string | null;
    }

    /** Represents a PackageStatuses. */
    class PackageStatuses implements IPackageStatuses {
      /**
       * Constructs a new PackageStatuses.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IPackageStatuses);

      /** PackageStatuses packages. */
      public packages: { [k: string]: opamp.proto.IPackageStatus };

      /** PackageStatuses serverProvidedAllPackagesHash. */
      public serverProvidedAllPackagesHash: Uint8Array;

      /** PackageStatuses errorMessage. */
      public errorMessage: string;

      /**
       * Creates a new PackageStatuses instance using the specified properties.
       * @param [properties] Properties to set
       * @returns PackageStatuses instance
       */
      public static create(
        properties?: opamp.proto.IPackageStatuses
      ): opamp.proto.PackageStatuses;

      /**
       * Encodes the specified PackageStatuses message. Does not implicitly {@link opamp.proto.PackageStatuses.verify|verify} messages.
       * @param message PackageStatuses message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IPackageStatuses,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified PackageStatuses message, length delimited. Does not implicitly {@link opamp.proto.PackageStatuses.verify|verify} messages.
       * @param message PackageStatuses message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IPackageStatuses,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a PackageStatuses message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns PackageStatuses
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.PackageStatuses;

      /**
       * Decodes a PackageStatuses message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns PackageStatuses
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.PackageStatuses;

      /**
       * Verifies a PackageStatuses message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a PackageStatuses message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns PackageStatuses
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.PackageStatuses;

      /**
       * Creates a plain object from a PackageStatuses message. Also converts values to other types if specified.
       * @param message PackageStatuses
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.PackageStatuses,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this PackageStatuses to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for PackageStatuses
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a PackageStatus. */
    interface IPackageStatus {
      /** PackageStatus name */
      name?: string | null;

      /** PackageStatus agentHasVersion */
      agentHasVersion?: string | null;

      /** PackageStatus agentHasHash */
      agentHasHash?: Uint8Array | null;

      /** PackageStatus serverOfferedVersion */
      serverOfferedVersion?: string | null;

      /** PackageStatus serverOfferedHash */
      serverOfferedHash?: Uint8Array | null;

      /** PackageStatus status */
      status?: opamp.proto.PackageStatusEnum | null;

      /** PackageStatus errorMessage */
      errorMessage?: string | null;

      /** PackageStatus downloadDetails */
      downloadDetails?: opamp.proto.IPackageDownloadDetails | null;
    }

    /** Represents a PackageStatus. */
    class PackageStatus implements IPackageStatus {
      /**
       * Constructs a new PackageStatus.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IPackageStatus);

      /** PackageStatus name. */
      public name: string;

      /** PackageStatus agentHasVersion. */
      public agentHasVersion: string;

      /** PackageStatus agentHasHash. */
      public agentHasHash: Uint8Array;

      /** PackageStatus serverOfferedVersion. */
      public serverOfferedVersion: string;

      /** PackageStatus serverOfferedHash. */
      public serverOfferedHash: Uint8Array;

      /** PackageStatus status. */
      public status: opamp.proto.PackageStatusEnum;

      /** PackageStatus errorMessage. */
      public errorMessage: string;

      /** PackageStatus downloadDetails. */
      public downloadDetails?: opamp.proto.IPackageDownloadDetails | null;

      /**
       * Creates a new PackageStatus instance using the specified properties.
       * @param [properties] Properties to set
       * @returns PackageStatus instance
       */
      public static create(
        properties?: opamp.proto.IPackageStatus
      ): opamp.proto.PackageStatus;

      /**
       * Encodes the specified PackageStatus message. Does not implicitly {@link opamp.proto.PackageStatus.verify|verify} messages.
       * @param message PackageStatus message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IPackageStatus,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified PackageStatus message, length delimited. Does not implicitly {@link opamp.proto.PackageStatus.verify|verify} messages.
       * @param message PackageStatus message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IPackageStatus,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a PackageStatus message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns PackageStatus
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.PackageStatus;

      /**
       * Decodes a PackageStatus message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns PackageStatus
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.PackageStatus;

      /**
       * Verifies a PackageStatus message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a PackageStatus message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns PackageStatus
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.PackageStatus;

      /**
       * Creates a plain object from a PackageStatus message. Also converts values to other types if specified.
       * @param message PackageStatus
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.PackageStatus,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this PackageStatus to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for PackageStatus
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a PackageDownloadDetails. */
    interface IPackageDownloadDetails {
      /** PackageDownloadDetails downloadPercent */
      downloadPercent?: number | null;

      /** PackageDownloadDetails downloadBytesPerSecond */
      downloadBytesPerSecond?: number | null;
    }

    /** Represents a PackageDownloadDetails. */
    class PackageDownloadDetails implements IPackageDownloadDetails {
      /**
       * Constructs a new PackageDownloadDetails.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IPackageDownloadDetails);

      /** PackageDownloadDetails downloadPercent. */
      public downloadPercent: number;

      /** PackageDownloadDetails downloadBytesPerSecond. */
      public downloadBytesPerSecond: number;

      /**
       * Creates a new PackageDownloadDetails instance using the specified properties.
       * @param [properties] Properties to set
       * @returns PackageDownloadDetails instance
       */
      public static create(
        properties?: opamp.proto.IPackageDownloadDetails
      ): opamp.proto.PackageDownloadDetails;

      /**
       * Encodes the specified PackageDownloadDetails message. Does not implicitly {@link opamp.proto.PackageDownloadDetails.verify|verify} messages.
       * @param message PackageDownloadDetails message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IPackageDownloadDetails,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified PackageDownloadDetails message, length delimited. Does not implicitly {@link opamp.proto.PackageDownloadDetails.verify|verify} messages.
       * @param message PackageDownloadDetails message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IPackageDownloadDetails,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a PackageDownloadDetails message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns PackageDownloadDetails
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.PackageDownloadDetails;

      /**
       * Decodes a PackageDownloadDetails message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns PackageDownloadDetails
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.PackageDownloadDetails;

      /**
       * Verifies a PackageDownloadDetails message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a PackageDownloadDetails message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns PackageDownloadDetails
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.PackageDownloadDetails;

      /**
       * Creates a plain object from a PackageDownloadDetails message. Also converts values to other types if specified.
       * @param message PackageDownloadDetails
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.PackageDownloadDetails,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this PackageDownloadDetails to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for PackageDownloadDetails
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** PackageStatusEnum enum. */
    enum PackageStatusEnum {
      PackageStatusEnum_Installed = 0,
      PackageStatusEnum_InstallPending = 1,
      PackageStatusEnum_Installing = 2,
      PackageStatusEnum_InstallFailed = 3,
      PackageStatusEnum_Downloading = 4,
    }

    /** Properties of an AgentIdentification. */
    interface IAgentIdentification {
      /** AgentIdentification newInstanceUid */
      newInstanceUid?: Uint8Array | null;
    }

    /** Represents an AgentIdentification. */
    class AgentIdentification implements IAgentIdentification {
      /**
       * Constructs a new AgentIdentification.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IAgentIdentification);

      /** AgentIdentification newInstanceUid. */
      public newInstanceUid: Uint8Array;

      /**
       * Creates a new AgentIdentification instance using the specified properties.
       * @param [properties] Properties to set
       * @returns AgentIdentification instance
       */
      public static create(
        properties?: opamp.proto.IAgentIdentification
      ): opamp.proto.AgentIdentification;

      /**
       * Encodes the specified AgentIdentification message. Does not implicitly {@link opamp.proto.AgentIdentification.verify|verify} messages.
       * @param message AgentIdentification message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IAgentIdentification,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified AgentIdentification message, length delimited. Does not implicitly {@link opamp.proto.AgentIdentification.verify|verify} messages.
       * @param message AgentIdentification message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IAgentIdentification,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes an AgentIdentification message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns AgentIdentification
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.AgentIdentification;

      /**
       * Decodes an AgentIdentification message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns AgentIdentification
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.AgentIdentification;

      /**
       * Verifies an AgentIdentification message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates an AgentIdentification message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns AgentIdentification
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.AgentIdentification;

      /**
       * Creates a plain object from an AgentIdentification message. Also converts values to other types if specified.
       * @param message AgentIdentification
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.AgentIdentification,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this AgentIdentification to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for AgentIdentification
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an AgentRemoteConfig. */
    interface IAgentRemoteConfig {
      /** AgentRemoteConfig config */
      config?: opamp.proto.IAgentConfigMap | null;

      /** AgentRemoteConfig configHash */
      configHash?: Uint8Array | null;
    }

    /** Represents an AgentRemoteConfig. */
    class AgentRemoteConfig implements IAgentRemoteConfig {
      /**
       * Constructs a new AgentRemoteConfig.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IAgentRemoteConfig);

      /** AgentRemoteConfig config. */
      public config?: opamp.proto.IAgentConfigMap | null;

      /** AgentRemoteConfig configHash. */
      public configHash: Uint8Array;

      /**
       * Creates a new AgentRemoteConfig instance using the specified properties.
       * @param [properties] Properties to set
       * @returns AgentRemoteConfig instance
       */
      public static create(
        properties?: opamp.proto.IAgentRemoteConfig
      ): opamp.proto.AgentRemoteConfig;

      /**
       * Encodes the specified AgentRemoteConfig message. Does not implicitly {@link opamp.proto.AgentRemoteConfig.verify|verify} messages.
       * @param message AgentRemoteConfig message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IAgentRemoteConfig,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified AgentRemoteConfig message, length delimited. Does not implicitly {@link opamp.proto.AgentRemoteConfig.verify|verify} messages.
       * @param message AgentRemoteConfig message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IAgentRemoteConfig,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes an AgentRemoteConfig message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns AgentRemoteConfig
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.AgentRemoteConfig;

      /**
       * Decodes an AgentRemoteConfig message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns AgentRemoteConfig
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.AgentRemoteConfig;

      /**
       * Verifies an AgentRemoteConfig message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates an AgentRemoteConfig message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns AgentRemoteConfig
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.AgentRemoteConfig;

      /**
       * Creates a plain object from an AgentRemoteConfig message. Also converts values to other types if specified.
       * @param message AgentRemoteConfig
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.AgentRemoteConfig,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this AgentRemoteConfig to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for AgentRemoteConfig
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an AgentConfigMap. */
    interface IAgentConfigMap {
      /** AgentConfigMap configMap */
      configMap?: { [k: string]: opamp.proto.IAgentConfigFile } | null;
    }

    /** Represents an AgentConfigMap. */
    class AgentConfigMap implements IAgentConfigMap {
      /**
       * Constructs a new AgentConfigMap.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IAgentConfigMap);

      /** AgentConfigMap configMap. */
      public configMap: { [k: string]: opamp.proto.IAgentConfigFile };

      /**
       * Creates a new AgentConfigMap instance using the specified properties.
       * @param [properties] Properties to set
       * @returns AgentConfigMap instance
       */
      public static create(
        properties?: opamp.proto.IAgentConfigMap
      ): opamp.proto.AgentConfigMap;

      /**
       * Encodes the specified AgentConfigMap message. Does not implicitly {@link opamp.proto.AgentConfigMap.verify|verify} messages.
       * @param message AgentConfigMap message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IAgentConfigMap,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified AgentConfigMap message, length delimited. Does not implicitly {@link opamp.proto.AgentConfigMap.verify|verify} messages.
       * @param message AgentConfigMap message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IAgentConfigMap,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes an AgentConfigMap message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns AgentConfigMap
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.AgentConfigMap;

      /**
       * Decodes an AgentConfigMap message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns AgentConfigMap
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.AgentConfigMap;

      /**
       * Verifies an AgentConfigMap message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates an AgentConfigMap message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns AgentConfigMap
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.AgentConfigMap;

      /**
       * Creates a plain object from an AgentConfigMap message. Also converts values to other types if specified.
       * @param message AgentConfigMap
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.AgentConfigMap,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this AgentConfigMap to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for AgentConfigMap
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an AgentConfigFile. */
    interface IAgentConfigFile {
      /** AgentConfigFile body */
      body?: Uint8Array | null;

      /** AgentConfigFile contentType */
      contentType?: string | null;
    }

    /** Represents an AgentConfigFile. */
    class AgentConfigFile implements IAgentConfigFile {
      /**
       * Constructs a new AgentConfigFile.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IAgentConfigFile);

      /** AgentConfigFile body. */
      public body: Uint8Array;

      /** AgentConfigFile contentType. */
      public contentType: string;

      /**
       * Creates a new AgentConfigFile instance using the specified properties.
       * @param [properties] Properties to set
       * @returns AgentConfigFile instance
       */
      public static create(
        properties?: opamp.proto.IAgentConfigFile
      ): opamp.proto.AgentConfigFile;

      /**
       * Encodes the specified AgentConfigFile message. Does not implicitly {@link opamp.proto.AgentConfigFile.verify|verify} messages.
       * @param message AgentConfigFile message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IAgentConfigFile,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified AgentConfigFile message, length delimited. Does not implicitly {@link opamp.proto.AgentConfigFile.verify|verify} messages.
       * @param message AgentConfigFile message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IAgentConfigFile,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes an AgentConfigFile message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns AgentConfigFile
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.AgentConfigFile;

      /**
       * Decodes an AgentConfigFile message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns AgentConfigFile
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.AgentConfigFile;

      /**
       * Verifies an AgentConfigFile message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates an AgentConfigFile message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns AgentConfigFile
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.AgentConfigFile;

      /**
       * Creates a plain object from an AgentConfigFile message. Also converts values to other types if specified.
       * @param message AgentConfigFile
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.AgentConfigFile,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this AgentConfigFile to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for AgentConfigFile
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CustomCapabilities. */
    interface ICustomCapabilities {
      /** CustomCapabilities capabilities */
      capabilities?: string[] | null;
    }

    /** Represents a CustomCapabilities. */
    class CustomCapabilities implements ICustomCapabilities {
      /**
       * Constructs a new CustomCapabilities.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.ICustomCapabilities);

      /** CustomCapabilities capabilities. */
      public capabilities: string[];

      /**
       * Creates a new CustomCapabilities instance using the specified properties.
       * @param [properties] Properties to set
       * @returns CustomCapabilities instance
       */
      public static create(
        properties?: opamp.proto.ICustomCapabilities
      ): opamp.proto.CustomCapabilities;

      /**
       * Encodes the specified CustomCapabilities message. Does not implicitly {@link opamp.proto.CustomCapabilities.verify|verify} messages.
       * @param message CustomCapabilities message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.ICustomCapabilities,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified CustomCapabilities message, length delimited. Does not implicitly {@link opamp.proto.CustomCapabilities.verify|verify} messages.
       * @param message CustomCapabilities message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.ICustomCapabilities,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a CustomCapabilities message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns CustomCapabilities
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.CustomCapabilities;

      /**
       * Decodes a CustomCapabilities message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns CustomCapabilities
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.CustomCapabilities;

      /**
       * Verifies a CustomCapabilities message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a CustomCapabilities message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns CustomCapabilities
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.CustomCapabilities;

      /**
       * Creates a plain object from a CustomCapabilities message. Also converts values to other types if specified.
       * @param message CustomCapabilities
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.CustomCapabilities,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this CustomCapabilities to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for CustomCapabilities
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CustomMessage. */
    interface ICustomMessage {
      /** CustomMessage capability */
      capability?: string | null;

      /** CustomMessage type */
      type?: string | null;

      /** CustomMessage data */
      data?: Uint8Array | null;
    }

    /** Represents a CustomMessage. */
    class CustomMessage implements ICustomMessage {
      /**
       * Constructs a new CustomMessage.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.ICustomMessage);

      /** CustomMessage capability. */
      public capability: string;

      /** CustomMessage type. */
      public type: string;

      /** CustomMessage data. */
      public data: Uint8Array;

      /**
       * Creates a new CustomMessage instance using the specified properties.
       * @param [properties] Properties to set
       * @returns CustomMessage instance
       */
      public static create(
        properties?: opamp.proto.ICustomMessage
      ): opamp.proto.CustomMessage;

      /**
       * Encodes the specified CustomMessage message. Does not implicitly {@link opamp.proto.CustomMessage.verify|verify} messages.
       * @param message CustomMessage message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.ICustomMessage,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified CustomMessage message, length delimited. Does not implicitly {@link opamp.proto.CustomMessage.verify|verify} messages.
       * @param message CustomMessage message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.ICustomMessage,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a CustomMessage message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns CustomMessage
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.CustomMessage;

      /**
       * Decodes a CustomMessage message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns CustomMessage
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.CustomMessage;

      /**
       * Verifies a CustomMessage message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a CustomMessage message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns CustomMessage
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.CustomMessage;

      /**
       * Creates a plain object from a CustomMessage message. Also converts values to other types if specified.
       * @param message CustomMessage
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.CustomMessage,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this CustomMessage to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for CustomMessage
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an AnyValue. */
    interface IAnyValue {
      /** AnyValue stringValue */
      stringValue?: string | null;

      /** AnyValue boolValue */
      boolValue?: boolean | null;

      /** AnyValue intValue */
      intValue?: number | Long | null;

      /** AnyValue doubleValue */
      doubleValue?: number | null;

      /** AnyValue arrayValue */
      arrayValue?: opamp.proto.IArrayValue | null;

      /** AnyValue kvlistValue */
      kvlistValue?: opamp.proto.IKeyValueList | null;

      /** AnyValue bytesValue */
      bytesValue?: Uint8Array | null;
    }

    /** Represents an AnyValue. */
    class AnyValue implements IAnyValue {
      /**
       * Constructs a new AnyValue.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IAnyValue);

      /** AnyValue stringValue. */
      public stringValue?: string | null;

      /** AnyValue boolValue. */
      public boolValue?: boolean | null;

      /** AnyValue intValue. */
      public intValue?: number | Long | null;

      /** AnyValue doubleValue. */
      public doubleValue?: number | null;

      /** AnyValue arrayValue. */
      public arrayValue?: opamp.proto.IArrayValue | null;

      /** AnyValue kvlistValue. */
      public kvlistValue?: opamp.proto.IKeyValueList | null;

      /** AnyValue bytesValue. */
      public bytesValue?: Uint8Array | null;

      /** AnyValue value. */
      public value?:
        | 'stringValue'
        | 'boolValue'
        | 'intValue'
        | 'doubleValue'
        | 'arrayValue'
        | 'kvlistValue'
        | 'bytesValue';

      /**
       * Creates a new AnyValue instance using the specified properties.
       * @param [properties] Properties to set
       * @returns AnyValue instance
       */
      public static create(
        properties?: opamp.proto.IAnyValue
      ): opamp.proto.AnyValue;

      /**
       * Encodes the specified AnyValue message. Does not implicitly {@link opamp.proto.AnyValue.verify|verify} messages.
       * @param message AnyValue message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IAnyValue,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified AnyValue message, length delimited. Does not implicitly {@link opamp.proto.AnyValue.verify|verify} messages.
       * @param message AnyValue message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IAnyValue,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes an AnyValue message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns AnyValue
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.AnyValue;

      /**
       * Decodes an AnyValue message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns AnyValue
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.AnyValue;

      /**
       * Verifies an AnyValue message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates an AnyValue message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns AnyValue
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.AnyValue;

      /**
       * Creates a plain object from an AnyValue message. Also converts values to other types if specified.
       * @param message AnyValue
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.AnyValue,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this AnyValue to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for AnyValue
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an ArrayValue. */
    interface IArrayValue {
      /** ArrayValue values */
      values?: opamp.proto.IAnyValue[] | null;
    }

    /** Represents an ArrayValue. */
    class ArrayValue implements IArrayValue {
      /**
       * Constructs a new ArrayValue.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IArrayValue);

      /** ArrayValue values. */
      public values: opamp.proto.IAnyValue[];

      /**
       * Creates a new ArrayValue instance using the specified properties.
       * @param [properties] Properties to set
       * @returns ArrayValue instance
       */
      public static create(
        properties?: opamp.proto.IArrayValue
      ): opamp.proto.ArrayValue;

      /**
       * Encodes the specified ArrayValue message. Does not implicitly {@link opamp.proto.ArrayValue.verify|verify} messages.
       * @param message ArrayValue message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IArrayValue,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified ArrayValue message, length delimited. Does not implicitly {@link opamp.proto.ArrayValue.verify|verify} messages.
       * @param message ArrayValue message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IArrayValue,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes an ArrayValue message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns ArrayValue
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.ArrayValue;

      /**
       * Decodes an ArrayValue message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns ArrayValue
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.ArrayValue;

      /**
       * Verifies an ArrayValue message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates an ArrayValue message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns ArrayValue
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.ArrayValue;

      /**
       * Creates a plain object from an ArrayValue message. Also converts values to other types if specified.
       * @param message ArrayValue
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.ArrayValue,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this ArrayValue to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for ArrayValue
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a KeyValueList. */
    interface IKeyValueList {
      /** KeyValueList values */
      values?: opamp.proto.IKeyValue[] | null;
    }

    /** Represents a KeyValueList. */
    class KeyValueList implements IKeyValueList {
      /**
       * Constructs a new KeyValueList.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IKeyValueList);

      /** KeyValueList values. */
      public values: opamp.proto.IKeyValue[];

      /**
       * Creates a new KeyValueList instance using the specified properties.
       * @param [properties] Properties to set
       * @returns KeyValueList instance
       */
      public static create(
        properties?: opamp.proto.IKeyValueList
      ): opamp.proto.KeyValueList;

      /**
       * Encodes the specified KeyValueList message. Does not implicitly {@link opamp.proto.KeyValueList.verify|verify} messages.
       * @param message KeyValueList message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IKeyValueList,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified KeyValueList message, length delimited. Does not implicitly {@link opamp.proto.KeyValueList.verify|verify} messages.
       * @param message KeyValueList message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IKeyValueList,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a KeyValueList message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns KeyValueList
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.KeyValueList;

      /**
       * Decodes a KeyValueList message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns KeyValueList
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.KeyValueList;

      /**
       * Verifies a KeyValueList message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a KeyValueList message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns KeyValueList
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.KeyValueList;

      /**
       * Creates a plain object from a KeyValueList message. Also converts values to other types if specified.
       * @param message KeyValueList
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.KeyValueList,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this KeyValueList to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for KeyValueList
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a KeyValue. */
    interface IKeyValue {
      /** KeyValue key */
      key?: string | null;

      /** KeyValue value */
      value?: opamp.proto.IAnyValue | null;
    }

    /** Represents a KeyValue. */
    class KeyValue implements IKeyValue {
      /**
       * Constructs a new KeyValue.
       * @param [properties] Properties to set
       */
      constructor(properties?: opamp.proto.IKeyValue);

      /** KeyValue key. */
      public key: string;

      /** KeyValue value. */
      public value?: opamp.proto.IAnyValue | null;

      /**
       * Creates a new KeyValue instance using the specified properties.
       * @param [properties] Properties to set
       * @returns KeyValue instance
       */
      public static create(
        properties?: opamp.proto.IKeyValue
      ): opamp.proto.KeyValue;

      /**
       * Encodes the specified KeyValue message. Does not implicitly {@link opamp.proto.KeyValue.verify|verify} messages.
       * @param message KeyValue message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encode(
        message: opamp.proto.IKeyValue,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified KeyValue message, length delimited. Does not implicitly {@link opamp.proto.KeyValue.verify|verify} messages.
       * @param message KeyValue message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      public static encodeDelimited(
        message: opamp.proto.IKeyValue,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a KeyValue message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns KeyValue
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): opamp.proto.KeyValue;

      /**
       * Decodes a KeyValue message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns KeyValue
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): opamp.proto.KeyValue;

      /**
       * Verifies a KeyValue message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      public static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a KeyValue message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns KeyValue
       */
      public static fromObject(object: {
        [k: string]: any;
      }): opamp.proto.KeyValue;

      /**
       * Creates a plain object from a KeyValue message. Also converts values to other types if specified.
       * @param message KeyValue
       * @param [options] Conversion options
       * @returns Plain object
       */
      public static toObject(
        message: opamp.proto.KeyValue,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this KeyValue to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };

      /**
       * Gets the default type url for KeyValue
       * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns The default type url
       */
      public static getTypeUrl(typeUrlPrefix?: string): string;
    }
  }
}
