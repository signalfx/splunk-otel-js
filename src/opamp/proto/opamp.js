/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.opamp = (function() {

    /**
     * Namespace opamp.
     * @exports opamp
     * @namespace
     */
    var opamp = {};

    opamp.proto = (function() {

        /**
         * Namespace proto.
         * @memberof opamp
         * @namespace
         */
        var proto = {};

        proto.AgentToServer = (function() {

            /**
             * Properties of an AgentToServer.
             * @memberof opamp.proto
             * @interface IAgentToServer
             * @property {Uint8Array|null} [instanceUid] AgentToServer instanceUid
             * @property {number|Long|null} [sequenceNum] AgentToServer sequenceNum
             * @property {opamp.proto.IAgentDescription|null} [agentDescription] AgentToServer agentDescription
             * @property {number|Long|null} [capabilities] AgentToServer capabilities
             * @property {opamp.proto.IComponentHealth|null} [health] AgentToServer health
             * @property {opamp.proto.IEffectiveConfig|null} [effectiveConfig] AgentToServer effectiveConfig
             * @property {opamp.proto.IRemoteConfigStatus|null} [remoteConfigStatus] AgentToServer remoteConfigStatus
             * @property {opamp.proto.IPackageStatuses|null} [packageStatuses] AgentToServer packageStatuses
             * @property {opamp.proto.IAgentDisconnect|null} [agentDisconnect] AgentToServer agentDisconnect
             * @property {number|Long|null} [flags] AgentToServer flags
             * @property {opamp.proto.IConnectionSettingsRequest|null} [connectionSettingsRequest] AgentToServer connectionSettingsRequest
             * @property {opamp.proto.ICustomCapabilities|null} [customCapabilities] AgentToServer customCapabilities
             * @property {opamp.proto.ICustomMessage|null} [customMessage] AgentToServer customMessage
             * @property {opamp.proto.IAvailableComponents|null} [availableComponents] AgentToServer availableComponents
             * @property {opamp.proto.IConnectionSettingsStatus|null} [connectionSettingsStatus] AgentToServer connectionSettingsStatus
             */

            /**
             * Constructs a new AgentToServer.
             * @memberof opamp.proto
             * @classdesc Represents an AgentToServer.
             * @implements IAgentToServer
             * @constructor
             * @param {opamp.proto.IAgentToServer=} [properties] Properties to set
             */
            function AgentToServer(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * AgentToServer instanceUid.
             * @member {Uint8Array} instanceUid
             * @memberof opamp.proto.AgentToServer
             * @instance
             */
            AgentToServer.prototype.instanceUid = $util.newBuffer([]);

            /**
             * AgentToServer sequenceNum.
             * @member {number|Long} sequenceNum
             * @memberof opamp.proto.AgentToServer
             * @instance
             */
            AgentToServer.prototype.sequenceNum = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * AgentToServer agentDescription.
             * @member {opamp.proto.IAgentDescription|null|undefined} agentDescription
             * @memberof opamp.proto.AgentToServer
             * @instance
             */
            AgentToServer.prototype.agentDescription = null;

            /**
             * AgentToServer capabilities.
             * @member {number|Long} capabilities
             * @memberof opamp.proto.AgentToServer
             * @instance
             */
            AgentToServer.prototype.capabilities = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * AgentToServer health.
             * @member {opamp.proto.IComponentHealth|null|undefined} health
             * @memberof opamp.proto.AgentToServer
             * @instance
             */
            AgentToServer.prototype.health = null;

            /**
             * AgentToServer effectiveConfig.
             * @member {opamp.proto.IEffectiveConfig|null|undefined} effectiveConfig
             * @memberof opamp.proto.AgentToServer
             * @instance
             */
            AgentToServer.prototype.effectiveConfig = null;

            /**
             * AgentToServer remoteConfigStatus.
             * @member {opamp.proto.IRemoteConfigStatus|null|undefined} remoteConfigStatus
             * @memberof opamp.proto.AgentToServer
             * @instance
             */
            AgentToServer.prototype.remoteConfigStatus = null;

            /**
             * AgentToServer packageStatuses.
             * @member {opamp.proto.IPackageStatuses|null|undefined} packageStatuses
             * @memberof opamp.proto.AgentToServer
             * @instance
             */
            AgentToServer.prototype.packageStatuses = null;

            /**
             * AgentToServer agentDisconnect.
             * @member {opamp.proto.IAgentDisconnect|null|undefined} agentDisconnect
             * @memberof opamp.proto.AgentToServer
             * @instance
             */
            AgentToServer.prototype.agentDisconnect = null;

            /**
             * AgentToServer flags.
             * @member {number|Long} flags
             * @memberof opamp.proto.AgentToServer
             * @instance
             */
            AgentToServer.prototype.flags = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * AgentToServer connectionSettingsRequest.
             * @member {opamp.proto.IConnectionSettingsRequest|null|undefined} connectionSettingsRequest
             * @memberof opamp.proto.AgentToServer
             * @instance
             */
            AgentToServer.prototype.connectionSettingsRequest = null;

            /**
             * AgentToServer customCapabilities.
             * @member {opamp.proto.ICustomCapabilities|null|undefined} customCapabilities
             * @memberof opamp.proto.AgentToServer
             * @instance
             */
            AgentToServer.prototype.customCapabilities = null;

            /**
             * AgentToServer customMessage.
             * @member {opamp.proto.ICustomMessage|null|undefined} customMessage
             * @memberof opamp.proto.AgentToServer
             * @instance
             */
            AgentToServer.prototype.customMessage = null;

            /**
             * AgentToServer availableComponents.
             * @member {opamp.proto.IAvailableComponents|null|undefined} availableComponents
             * @memberof opamp.proto.AgentToServer
             * @instance
             */
            AgentToServer.prototype.availableComponents = null;

            /**
             * AgentToServer connectionSettingsStatus.
             * @member {opamp.proto.IConnectionSettingsStatus|null|undefined} connectionSettingsStatus
             * @memberof opamp.proto.AgentToServer
             * @instance
             */
            AgentToServer.prototype.connectionSettingsStatus = null;

            /**
             * Creates a new AgentToServer instance using the specified properties.
             * @function create
             * @memberof opamp.proto.AgentToServer
             * @static
             * @param {opamp.proto.IAgentToServer=} [properties] Properties to set
             * @returns {opamp.proto.AgentToServer} AgentToServer instance
             */
            AgentToServer.create = function create(properties) {
                return new AgentToServer(properties);
            };

            /**
             * Encodes the specified AgentToServer message. Does not implicitly {@link opamp.proto.AgentToServer.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.AgentToServer
             * @static
             * @param {opamp.proto.IAgentToServer} message AgentToServer message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AgentToServer.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.instanceUid != null && Object.hasOwnProperty.call(message, "instanceUid"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.instanceUid);
                if (message.sequenceNum != null && Object.hasOwnProperty.call(message, "sequenceNum"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.sequenceNum);
                if (message.agentDescription != null && Object.hasOwnProperty.call(message, "agentDescription"))
                    $root.opamp.proto.AgentDescription.encode(message.agentDescription, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.capabilities != null && Object.hasOwnProperty.call(message, "capabilities"))
                    writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.capabilities);
                if (message.health != null && Object.hasOwnProperty.call(message, "health"))
                    $root.opamp.proto.ComponentHealth.encode(message.health, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                if (message.effectiveConfig != null && Object.hasOwnProperty.call(message, "effectiveConfig"))
                    $root.opamp.proto.EffectiveConfig.encode(message.effectiveConfig, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                if (message.remoteConfigStatus != null && Object.hasOwnProperty.call(message, "remoteConfigStatus"))
                    $root.opamp.proto.RemoteConfigStatus.encode(message.remoteConfigStatus, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
                if (message.packageStatuses != null && Object.hasOwnProperty.call(message, "packageStatuses"))
                    $root.opamp.proto.PackageStatuses.encode(message.packageStatuses, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
                if (message.agentDisconnect != null && Object.hasOwnProperty.call(message, "agentDisconnect"))
                    $root.opamp.proto.AgentDisconnect.encode(message.agentDisconnect, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
                if (message.flags != null && Object.hasOwnProperty.call(message, "flags"))
                    writer.uint32(/* id 10, wireType 0 =*/80).uint64(message.flags);
                if (message.connectionSettingsRequest != null && Object.hasOwnProperty.call(message, "connectionSettingsRequest"))
                    $root.opamp.proto.ConnectionSettingsRequest.encode(message.connectionSettingsRequest, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
                if (message.customCapabilities != null && Object.hasOwnProperty.call(message, "customCapabilities"))
                    $root.opamp.proto.CustomCapabilities.encode(message.customCapabilities, writer.uint32(/* id 12, wireType 2 =*/98).fork()).ldelim();
                if (message.customMessage != null && Object.hasOwnProperty.call(message, "customMessage"))
                    $root.opamp.proto.CustomMessage.encode(message.customMessage, writer.uint32(/* id 13, wireType 2 =*/106).fork()).ldelim();
                if (message.availableComponents != null && Object.hasOwnProperty.call(message, "availableComponents"))
                    $root.opamp.proto.AvailableComponents.encode(message.availableComponents, writer.uint32(/* id 14, wireType 2 =*/114).fork()).ldelim();
                if (message.connectionSettingsStatus != null && Object.hasOwnProperty.call(message, "connectionSettingsStatus"))
                    $root.opamp.proto.ConnectionSettingsStatus.encode(message.connectionSettingsStatus, writer.uint32(/* id 15, wireType 2 =*/122).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified AgentToServer message, length delimited. Does not implicitly {@link opamp.proto.AgentToServer.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.AgentToServer
             * @static
             * @param {opamp.proto.IAgentToServer} message AgentToServer message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AgentToServer.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an AgentToServer message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.AgentToServer
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.AgentToServer} AgentToServer
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AgentToServer.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.AgentToServer();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.instanceUid = reader.bytes();
                            break;
                        }
                    case 2: {
                            message.sequenceNum = reader.uint64();
                            break;
                        }
                    case 3: {
                            message.agentDescription = $root.opamp.proto.AgentDescription.decode(reader, reader.uint32());
                            break;
                        }
                    case 4: {
                            message.capabilities = reader.uint64();
                            break;
                        }
                    case 5: {
                            message.health = $root.opamp.proto.ComponentHealth.decode(reader, reader.uint32());
                            break;
                        }
                    case 6: {
                            message.effectiveConfig = $root.opamp.proto.EffectiveConfig.decode(reader, reader.uint32());
                            break;
                        }
                    case 7: {
                            message.remoteConfigStatus = $root.opamp.proto.RemoteConfigStatus.decode(reader, reader.uint32());
                            break;
                        }
                    case 8: {
                            message.packageStatuses = $root.opamp.proto.PackageStatuses.decode(reader, reader.uint32());
                            break;
                        }
                    case 9: {
                            message.agentDisconnect = $root.opamp.proto.AgentDisconnect.decode(reader, reader.uint32());
                            break;
                        }
                    case 10: {
                            message.flags = reader.uint64();
                            break;
                        }
                    case 11: {
                            message.connectionSettingsRequest = $root.opamp.proto.ConnectionSettingsRequest.decode(reader, reader.uint32());
                            break;
                        }
                    case 12: {
                            message.customCapabilities = $root.opamp.proto.CustomCapabilities.decode(reader, reader.uint32());
                            break;
                        }
                    case 13: {
                            message.customMessage = $root.opamp.proto.CustomMessage.decode(reader, reader.uint32());
                            break;
                        }
                    case 14: {
                            message.availableComponents = $root.opamp.proto.AvailableComponents.decode(reader, reader.uint32());
                            break;
                        }
                    case 15: {
                            message.connectionSettingsStatus = $root.opamp.proto.ConnectionSettingsStatus.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an AgentToServer message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.AgentToServer
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.AgentToServer} AgentToServer
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AgentToServer.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an AgentToServer message.
             * @function verify
             * @memberof opamp.proto.AgentToServer
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            AgentToServer.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.instanceUid != null && message.hasOwnProperty("instanceUid"))
                    if (!(message.instanceUid && typeof message.instanceUid.length === "number" || $util.isString(message.instanceUid)))
                        return "instanceUid: buffer expected";
                if (message.sequenceNum != null && message.hasOwnProperty("sequenceNum"))
                    if (!$util.isInteger(message.sequenceNum) && !(message.sequenceNum && $util.isInteger(message.sequenceNum.low) && $util.isInteger(message.sequenceNum.high)))
                        return "sequenceNum: integer|Long expected";
                if (message.agentDescription != null && message.hasOwnProperty("agentDescription")) {
                    var error = $root.opamp.proto.AgentDescription.verify(message.agentDescription);
                    if (error)
                        return "agentDescription." + error;
                }
                if (message.capabilities != null && message.hasOwnProperty("capabilities"))
                    if (!$util.isInteger(message.capabilities) && !(message.capabilities && $util.isInteger(message.capabilities.low) && $util.isInteger(message.capabilities.high)))
                        return "capabilities: integer|Long expected";
                if (message.health != null && message.hasOwnProperty("health")) {
                    var error = $root.opamp.proto.ComponentHealth.verify(message.health);
                    if (error)
                        return "health." + error;
                }
                if (message.effectiveConfig != null && message.hasOwnProperty("effectiveConfig")) {
                    var error = $root.opamp.proto.EffectiveConfig.verify(message.effectiveConfig);
                    if (error)
                        return "effectiveConfig." + error;
                }
                if (message.remoteConfigStatus != null && message.hasOwnProperty("remoteConfigStatus")) {
                    var error = $root.opamp.proto.RemoteConfigStatus.verify(message.remoteConfigStatus);
                    if (error)
                        return "remoteConfigStatus." + error;
                }
                if (message.packageStatuses != null && message.hasOwnProperty("packageStatuses")) {
                    var error = $root.opamp.proto.PackageStatuses.verify(message.packageStatuses);
                    if (error)
                        return "packageStatuses." + error;
                }
                if (message.agentDisconnect != null && message.hasOwnProperty("agentDisconnect")) {
                    var error = $root.opamp.proto.AgentDisconnect.verify(message.agentDisconnect);
                    if (error)
                        return "agentDisconnect." + error;
                }
                if (message.flags != null && message.hasOwnProperty("flags"))
                    if (!$util.isInteger(message.flags) && !(message.flags && $util.isInteger(message.flags.low) && $util.isInteger(message.flags.high)))
                        return "flags: integer|Long expected";
                if (message.connectionSettingsRequest != null && message.hasOwnProperty("connectionSettingsRequest")) {
                    var error = $root.opamp.proto.ConnectionSettingsRequest.verify(message.connectionSettingsRequest);
                    if (error)
                        return "connectionSettingsRequest." + error;
                }
                if (message.customCapabilities != null && message.hasOwnProperty("customCapabilities")) {
                    var error = $root.opamp.proto.CustomCapabilities.verify(message.customCapabilities);
                    if (error)
                        return "customCapabilities." + error;
                }
                if (message.customMessage != null && message.hasOwnProperty("customMessage")) {
                    var error = $root.opamp.proto.CustomMessage.verify(message.customMessage);
                    if (error)
                        return "customMessage." + error;
                }
                if (message.availableComponents != null && message.hasOwnProperty("availableComponents")) {
                    var error = $root.opamp.proto.AvailableComponents.verify(message.availableComponents);
                    if (error)
                        return "availableComponents." + error;
                }
                if (message.connectionSettingsStatus != null && message.hasOwnProperty("connectionSettingsStatus")) {
                    var error = $root.opamp.proto.ConnectionSettingsStatus.verify(message.connectionSettingsStatus);
                    if (error)
                        return "connectionSettingsStatus." + error;
                }
                return null;
            };

            /**
             * Creates an AgentToServer message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.AgentToServer
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.AgentToServer} AgentToServer
             */
            AgentToServer.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.AgentToServer)
                    return object;
                var message = new $root.opamp.proto.AgentToServer();
                if (object.instanceUid != null)
                    if (typeof object.instanceUid === "string")
                        $util.base64.decode(object.instanceUid, message.instanceUid = $util.newBuffer($util.base64.length(object.instanceUid)), 0);
                    else if (object.instanceUid.length >= 0)
                        message.instanceUid = object.instanceUid;
                if (object.sequenceNum != null)
                    if ($util.Long)
                        (message.sequenceNum = $util.Long.fromValue(object.sequenceNum)).unsigned = true;
                    else if (typeof object.sequenceNum === "string")
                        message.sequenceNum = parseInt(object.sequenceNum, 10);
                    else if (typeof object.sequenceNum === "number")
                        message.sequenceNum = object.sequenceNum;
                    else if (typeof object.sequenceNum === "object")
                        message.sequenceNum = new $util.LongBits(object.sequenceNum.low >>> 0, object.sequenceNum.high >>> 0).toNumber(true);
                if (object.agentDescription != null) {
                    if (typeof object.agentDescription !== "object")
                        throw TypeError(".opamp.proto.AgentToServer.agentDescription: object expected");
                    message.agentDescription = $root.opamp.proto.AgentDescription.fromObject(object.agentDescription);
                }
                if (object.capabilities != null)
                    if ($util.Long)
                        (message.capabilities = $util.Long.fromValue(object.capabilities)).unsigned = true;
                    else if (typeof object.capabilities === "string")
                        message.capabilities = parseInt(object.capabilities, 10);
                    else if (typeof object.capabilities === "number")
                        message.capabilities = object.capabilities;
                    else if (typeof object.capabilities === "object")
                        message.capabilities = new $util.LongBits(object.capabilities.low >>> 0, object.capabilities.high >>> 0).toNumber(true);
                if (object.health != null) {
                    if (typeof object.health !== "object")
                        throw TypeError(".opamp.proto.AgentToServer.health: object expected");
                    message.health = $root.opamp.proto.ComponentHealth.fromObject(object.health);
                }
                if (object.effectiveConfig != null) {
                    if (typeof object.effectiveConfig !== "object")
                        throw TypeError(".opamp.proto.AgentToServer.effectiveConfig: object expected");
                    message.effectiveConfig = $root.opamp.proto.EffectiveConfig.fromObject(object.effectiveConfig);
                }
                if (object.remoteConfigStatus != null) {
                    if (typeof object.remoteConfigStatus !== "object")
                        throw TypeError(".opamp.proto.AgentToServer.remoteConfigStatus: object expected");
                    message.remoteConfigStatus = $root.opamp.proto.RemoteConfigStatus.fromObject(object.remoteConfigStatus);
                }
                if (object.packageStatuses != null) {
                    if (typeof object.packageStatuses !== "object")
                        throw TypeError(".opamp.proto.AgentToServer.packageStatuses: object expected");
                    message.packageStatuses = $root.opamp.proto.PackageStatuses.fromObject(object.packageStatuses);
                }
                if (object.agentDisconnect != null) {
                    if (typeof object.agentDisconnect !== "object")
                        throw TypeError(".opamp.proto.AgentToServer.agentDisconnect: object expected");
                    message.agentDisconnect = $root.opamp.proto.AgentDisconnect.fromObject(object.agentDisconnect);
                }
                if (object.flags != null)
                    if ($util.Long)
                        (message.flags = $util.Long.fromValue(object.flags)).unsigned = true;
                    else if (typeof object.flags === "string")
                        message.flags = parseInt(object.flags, 10);
                    else if (typeof object.flags === "number")
                        message.flags = object.flags;
                    else if (typeof object.flags === "object")
                        message.flags = new $util.LongBits(object.flags.low >>> 0, object.flags.high >>> 0).toNumber(true);
                if (object.connectionSettingsRequest != null) {
                    if (typeof object.connectionSettingsRequest !== "object")
                        throw TypeError(".opamp.proto.AgentToServer.connectionSettingsRequest: object expected");
                    message.connectionSettingsRequest = $root.opamp.proto.ConnectionSettingsRequest.fromObject(object.connectionSettingsRequest);
                }
                if (object.customCapabilities != null) {
                    if (typeof object.customCapabilities !== "object")
                        throw TypeError(".opamp.proto.AgentToServer.customCapabilities: object expected");
                    message.customCapabilities = $root.opamp.proto.CustomCapabilities.fromObject(object.customCapabilities);
                }
                if (object.customMessage != null) {
                    if (typeof object.customMessage !== "object")
                        throw TypeError(".opamp.proto.AgentToServer.customMessage: object expected");
                    message.customMessage = $root.opamp.proto.CustomMessage.fromObject(object.customMessage);
                }
                if (object.availableComponents != null) {
                    if (typeof object.availableComponents !== "object")
                        throw TypeError(".opamp.proto.AgentToServer.availableComponents: object expected");
                    message.availableComponents = $root.opamp.proto.AvailableComponents.fromObject(object.availableComponents);
                }
                if (object.connectionSettingsStatus != null) {
                    if (typeof object.connectionSettingsStatus !== "object")
                        throw TypeError(".opamp.proto.AgentToServer.connectionSettingsStatus: object expected");
                    message.connectionSettingsStatus = $root.opamp.proto.ConnectionSettingsStatus.fromObject(object.connectionSettingsStatus);
                }
                return message;
            };

            /**
             * Creates a plain object from an AgentToServer message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.AgentToServer
             * @static
             * @param {opamp.proto.AgentToServer} message AgentToServer
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            AgentToServer.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    if (options.bytes === String)
                        object.instanceUid = "";
                    else {
                        object.instanceUid = [];
                        if (options.bytes !== Array)
                            object.instanceUid = $util.newBuffer(object.instanceUid);
                    }
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.sequenceNum = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.sequenceNum = options.longs === String ? "0" : 0;
                    object.agentDescription = null;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.capabilities = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.capabilities = options.longs === String ? "0" : 0;
                    object.health = null;
                    object.effectiveConfig = null;
                    object.remoteConfigStatus = null;
                    object.packageStatuses = null;
                    object.agentDisconnect = null;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.flags = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.flags = options.longs === String ? "0" : 0;
                    object.connectionSettingsRequest = null;
                    object.customCapabilities = null;
                    object.customMessage = null;
                    object.availableComponents = null;
                    object.connectionSettingsStatus = null;
                }
                if (message.instanceUid != null && message.hasOwnProperty("instanceUid"))
                    object.instanceUid = options.bytes === String ? $util.base64.encode(message.instanceUid, 0, message.instanceUid.length) : options.bytes === Array ? Array.prototype.slice.call(message.instanceUid) : message.instanceUid;
                if (message.sequenceNum != null && message.hasOwnProperty("sequenceNum"))
                    if (typeof message.sequenceNum === "number")
                        object.sequenceNum = options.longs === String ? String(message.sequenceNum) : message.sequenceNum;
                    else
                        object.sequenceNum = options.longs === String ? $util.Long.prototype.toString.call(message.sequenceNum) : options.longs === Number ? new $util.LongBits(message.sequenceNum.low >>> 0, message.sequenceNum.high >>> 0).toNumber(true) : message.sequenceNum;
                if (message.agentDescription != null && message.hasOwnProperty("agentDescription"))
                    object.agentDescription = $root.opamp.proto.AgentDescription.toObject(message.agentDescription, options);
                if (message.capabilities != null && message.hasOwnProperty("capabilities"))
                    if (typeof message.capabilities === "number")
                        object.capabilities = options.longs === String ? String(message.capabilities) : message.capabilities;
                    else
                        object.capabilities = options.longs === String ? $util.Long.prototype.toString.call(message.capabilities) : options.longs === Number ? new $util.LongBits(message.capabilities.low >>> 0, message.capabilities.high >>> 0).toNumber(true) : message.capabilities;
                if (message.health != null && message.hasOwnProperty("health"))
                    object.health = $root.opamp.proto.ComponentHealth.toObject(message.health, options);
                if (message.effectiveConfig != null && message.hasOwnProperty("effectiveConfig"))
                    object.effectiveConfig = $root.opamp.proto.EffectiveConfig.toObject(message.effectiveConfig, options);
                if (message.remoteConfigStatus != null && message.hasOwnProperty("remoteConfigStatus"))
                    object.remoteConfigStatus = $root.opamp.proto.RemoteConfigStatus.toObject(message.remoteConfigStatus, options);
                if (message.packageStatuses != null && message.hasOwnProperty("packageStatuses"))
                    object.packageStatuses = $root.opamp.proto.PackageStatuses.toObject(message.packageStatuses, options);
                if (message.agentDisconnect != null && message.hasOwnProperty("agentDisconnect"))
                    object.agentDisconnect = $root.opamp.proto.AgentDisconnect.toObject(message.agentDisconnect, options);
                if (message.flags != null && message.hasOwnProperty("flags"))
                    if (typeof message.flags === "number")
                        object.flags = options.longs === String ? String(message.flags) : message.flags;
                    else
                        object.flags = options.longs === String ? $util.Long.prototype.toString.call(message.flags) : options.longs === Number ? new $util.LongBits(message.flags.low >>> 0, message.flags.high >>> 0).toNumber(true) : message.flags;
                if (message.connectionSettingsRequest != null && message.hasOwnProperty("connectionSettingsRequest"))
                    object.connectionSettingsRequest = $root.opamp.proto.ConnectionSettingsRequest.toObject(message.connectionSettingsRequest, options);
                if (message.customCapabilities != null && message.hasOwnProperty("customCapabilities"))
                    object.customCapabilities = $root.opamp.proto.CustomCapabilities.toObject(message.customCapabilities, options);
                if (message.customMessage != null && message.hasOwnProperty("customMessage"))
                    object.customMessage = $root.opamp.proto.CustomMessage.toObject(message.customMessage, options);
                if (message.availableComponents != null && message.hasOwnProperty("availableComponents"))
                    object.availableComponents = $root.opamp.proto.AvailableComponents.toObject(message.availableComponents, options);
                if (message.connectionSettingsStatus != null && message.hasOwnProperty("connectionSettingsStatus"))
                    object.connectionSettingsStatus = $root.opamp.proto.ConnectionSettingsStatus.toObject(message.connectionSettingsStatus, options);
                return object;
            };

            /**
             * Converts this AgentToServer to JSON.
             * @function toJSON
             * @memberof opamp.proto.AgentToServer
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            AgentToServer.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for AgentToServer
             * @function getTypeUrl
             * @memberof opamp.proto.AgentToServer
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            AgentToServer.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.AgentToServer";
            };

            return AgentToServer;
        })();

        /**
         * AgentToServerFlags enum.
         * @name opamp.proto.AgentToServerFlags
         * @enum {number}
         * @property {number} AgentToServerFlags_Unspecified=0 AgentToServerFlags_Unspecified value
         * @property {number} AgentToServerFlags_RequestInstanceUid=1 AgentToServerFlags_RequestInstanceUid value
         */
        proto.AgentToServerFlags = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "AgentToServerFlags_Unspecified"] = 0;
            values[valuesById[1] = "AgentToServerFlags_RequestInstanceUid"] = 1;
            return values;
        })();

        proto.AgentDisconnect = (function() {

            /**
             * Properties of an AgentDisconnect.
             * @memberof opamp.proto
             * @interface IAgentDisconnect
             */

            /**
             * Constructs a new AgentDisconnect.
             * @memberof opamp.proto
             * @classdesc Represents an AgentDisconnect.
             * @implements IAgentDisconnect
             * @constructor
             * @param {opamp.proto.IAgentDisconnect=} [properties] Properties to set
             */
            function AgentDisconnect(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Creates a new AgentDisconnect instance using the specified properties.
             * @function create
             * @memberof opamp.proto.AgentDisconnect
             * @static
             * @param {opamp.proto.IAgentDisconnect=} [properties] Properties to set
             * @returns {opamp.proto.AgentDisconnect} AgentDisconnect instance
             */
            AgentDisconnect.create = function create(properties) {
                return new AgentDisconnect(properties);
            };

            /**
             * Encodes the specified AgentDisconnect message. Does not implicitly {@link opamp.proto.AgentDisconnect.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.AgentDisconnect
             * @static
             * @param {opamp.proto.IAgentDisconnect} message AgentDisconnect message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AgentDisconnect.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                return writer;
            };

            /**
             * Encodes the specified AgentDisconnect message, length delimited. Does not implicitly {@link opamp.proto.AgentDisconnect.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.AgentDisconnect
             * @static
             * @param {opamp.proto.IAgentDisconnect} message AgentDisconnect message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AgentDisconnect.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an AgentDisconnect message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.AgentDisconnect
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.AgentDisconnect} AgentDisconnect
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AgentDisconnect.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.AgentDisconnect();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an AgentDisconnect message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.AgentDisconnect
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.AgentDisconnect} AgentDisconnect
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AgentDisconnect.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an AgentDisconnect message.
             * @function verify
             * @memberof opamp.proto.AgentDisconnect
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            AgentDisconnect.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                return null;
            };

            /**
             * Creates an AgentDisconnect message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.AgentDisconnect
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.AgentDisconnect} AgentDisconnect
             */
            AgentDisconnect.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.AgentDisconnect)
                    return object;
                return new $root.opamp.proto.AgentDisconnect();
            };

            /**
             * Creates a plain object from an AgentDisconnect message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.AgentDisconnect
             * @static
             * @param {opamp.proto.AgentDisconnect} message AgentDisconnect
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            AgentDisconnect.toObject = function toObject() {
                return {};
            };

            /**
             * Converts this AgentDisconnect to JSON.
             * @function toJSON
             * @memberof opamp.proto.AgentDisconnect
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            AgentDisconnect.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for AgentDisconnect
             * @function getTypeUrl
             * @memberof opamp.proto.AgentDisconnect
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            AgentDisconnect.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.AgentDisconnect";
            };

            return AgentDisconnect;
        })();

        proto.ConnectionSettingsRequest = (function() {

            /**
             * Properties of a ConnectionSettingsRequest.
             * @memberof opamp.proto
             * @interface IConnectionSettingsRequest
             * @property {opamp.proto.IOpAMPConnectionSettingsRequest|null} [opamp] ConnectionSettingsRequest opamp
             */

            /**
             * Constructs a new ConnectionSettingsRequest.
             * @memberof opamp.proto
             * @classdesc Represents a ConnectionSettingsRequest.
             * @implements IConnectionSettingsRequest
             * @constructor
             * @param {opamp.proto.IConnectionSettingsRequest=} [properties] Properties to set
             */
            function ConnectionSettingsRequest(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ConnectionSettingsRequest opamp.
             * @member {opamp.proto.IOpAMPConnectionSettingsRequest|null|undefined} opamp
             * @memberof opamp.proto.ConnectionSettingsRequest
             * @instance
             */
            ConnectionSettingsRequest.prototype.opamp = null;

            /**
             * Creates a new ConnectionSettingsRequest instance using the specified properties.
             * @function create
             * @memberof opamp.proto.ConnectionSettingsRequest
             * @static
             * @param {opamp.proto.IConnectionSettingsRequest=} [properties] Properties to set
             * @returns {opamp.proto.ConnectionSettingsRequest} ConnectionSettingsRequest instance
             */
            ConnectionSettingsRequest.create = function create(properties) {
                return new ConnectionSettingsRequest(properties);
            };

            /**
             * Encodes the specified ConnectionSettingsRequest message. Does not implicitly {@link opamp.proto.ConnectionSettingsRequest.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.ConnectionSettingsRequest
             * @static
             * @param {opamp.proto.IConnectionSettingsRequest} message ConnectionSettingsRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ConnectionSettingsRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.opamp != null && Object.hasOwnProperty.call(message, "opamp"))
                    $root.opamp.proto.OpAMPConnectionSettingsRequest.encode(message.opamp, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified ConnectionSettingsRequest message, length delimited. Does not implicitly {@link opamp.proto.ConnectionSettingsRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.ConnectionSettingsRequest
             * @static
             * @param {opamp.proto.IConnectionSettingsRequest} message ConnectionSettingsRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ConnectionSettingsRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ConnectionSettingsRequest message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.ConnectionSettingsRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.ConnectionSettingsRequest} ConnectionSettingsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ConnectionSettingsRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.ConnectionSettingsRequest();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.opamp = $root.opamp.proto.OpAMPConnectionSettingsRequest.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ConnectionSettingsRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.ConnectionSettingsRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.ConnectionSettingsRequest} ConnectionSettingsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ConnectionSettingsRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ConnectionSettingsRequest message.
             * @function verify
             * @memberof opamp.proto.ConnectionSettingsRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ConnectionSettingsRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.opamp != null && message.hasOwnProperty("opamp")) {
                    var error = $root.opamp.proto.OpAMPConnectionSettingsRequest.verify(message.opamp);
                    if (error)
                        return "opamp." + error;
                }
                return null;
            };

            /**
             * Creates a ConnectionSettingsRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.ConnectionSettingsRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.ConnectionSettingsRequest} ConnectionSettingsRequest
             */
            ConnectionSettingsRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.ConnectionSettingsRequest)
                    return object;
                var message = new $root.opamp.proto.ConnectionSettingsRequest();
                if (object.opamp != null) {
                    if (typeof object.opamp !== "object")
                        throw TypeError(".opamp.proto.ConnectionSettingsRequest.opamp: object expected");
                    message.opamp = $root.opamp.proto.OpAMPConnectionSettingsRequest.fromObject(object.opamp);
                }
                return message;
            };

            /**
             * Creates a plain object from a ConnectionSettingsRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.ConnectionSettingsRequest
             * @static
             * @param {opamp.proto.ConnectionSettingsRequest} message ConnectionSettingsRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ConnectionSettingsRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.opamp = null;
                if (message.opamp != null && message.hasOwnProperty("opamp"))
                    object.opamp = $root.opamp.proto.OpAMPConnectionSettingsRequest.toObject(message.opamp, options);
                return object;
            };

            /**
             * Converts this ConnectionSettingsRequest to JSON.
             * @function toJSON
             * @memberof opamp.proto.ConnectionSettingsRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ConnectionSettingsRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ConnectionSettingsRequest
             * @function getTypeUrl
             * @memberof opamp.proto.ConnectionSettingsRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ConnectionSettingsRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.ConnectionSettingsRequest";
            };

            return ConnectionSettingsRequest;
        })();

        proto.OpAMPConnectionSettingsRequest = (function() {

            /**
             * Properties of an OpAMPConnectionSettingsRequest.
             * @memberof opamp.proto
             * @interface IOpAMPConnectionSettingsRequest
             * @property {opamp.proto.ICertificateRequest|null} [certificateRequest] OpAMPConnectionSettingsRequest certificateRequest
             */

            /**
             * Constructs a new OpAMPConnectionSettingsRequest.
             * @memberof opamp.proto
             * @classdesc Represents an OpAMPConnectionSettingsRequest.
             * @implements IOpAMPConnectionSettingsRequest
             * @constructor
             * @param {opamp.proto.IOpAMPConnectionSettingsRequest=} [properties] Properties to set
             */
            function OpAMPConnectionSettingsRequest(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * OpAMPConnectionSettingsRequest certificateRequest.
             * @member {opamp.proto.ICertificateRequest|null|undefined} certificateRequest
             * @memberof opamp.proto.OpAMPConnectionSettingsRequest
             * @instance
             */
            OpAMPConnectionSettingsRequest.prototype.certificateRequest = null;

            /**
             * Creates a new OpAMPConnectionSettingsRequest instance using the specified properties.
             * @function create
             * @memberof opamp.proto.OpAMPConnectionSettingsRequest
             * @static
             * @param {opamp.proto.IOpAMPConnectionSettingsRequest=} [properties] Properties to set
             * @returns {opamp.proto.OpAMPConnectionSettingsRequest} OpAMPConnectionSettingsRequest instance
             */
            OpAMPConnectionSettingsRequest.create = function create(properties) {
                return new OpAMPConnectionSettingsRequest(properties);
            };

            /**
             * Encodes the specified OpAMPConnectionSettingsRequest message. Does not implicitly {@link opamp.proto.OpAMPConnectionSettingsRequest.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.OpAMPConnectionSettingsRequest
             * @static
             * @param {opamp.proto.IOpAMPConnectionSettingsRequest} message OpAMPConnectionSettingsRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            OpAMPConnectionSettingsRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.certificateRequest != null && Object.hasOwnProperty.call(message, "certificateRequest"))
                    $root.opamp.proto.CertificateRequest.encode(message.certificateRequest, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified OpAMPConnectionSettingsRequest message, length delimited. Does not implicitly {@link opamp.proto.OpAMPConnectionSettingsRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.OpAMPConnectionSettingsRequest
             * @static
             * @param {opamp.proto.IOpAMPConnectionSettingsRequest} message OpAMPConnectionSettingsRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            OpAMPConnectionSettingsRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an OpAMPConnectionSettingsRequest message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.OpAMPConnectionSettingsRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.OpAMPConnectionSettingsRequest} OpAMPConnectionSettingsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            OpAMPConnectionSettingsRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.OpAMPConnectionSettingsRequest();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.certificateRequest = $root.opamp.proto.CertificateRequest.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an OpAMPConnectionSettingsRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.OpAMPConnectionSettingsRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.OpAMPConnectionSettingsRequest} OpAMPConnectionSettingsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            OpAMPConnectionSettingsRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an OpAMPConnectionSettingsRequest message.
             * @function verify
             * @memberof opamp.proto.OpAMPConnectionSettingsRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            OpAMPConnectionSettingsRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.certificateRequest != null && message.hasOwnProperty("certificateRequest")) {
                    var error = $root.opamp.proto.CertificateRequest.verify(message.certificateRequest);
                    if (error)
                        return "certificateRequest." + error;
                }
                return null;
            };

            /**
             * Creates an OpAMPConnectionSettingsRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.OpAMPConnectionSettingsRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.OpAMPConnectionSettingsRequest} OpAMPConnectionSettingsRequest
             */
            OpAMPConnectionSettingsRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.OpAMPConnectionSettingsRequest)
                    return object;
                var message = new $root.opamp.proto.OpAMPConnectionSettingsRequest();
                if (object.certificateRequest != null) {
                    if (typeof object.certificateRequest !== "object")
                        throw TypeError(".opamp.proto.OpAMPConnectionSettingsRequest.certificateRequest: object expected");
                    message.certificateRequest = $root.opamp.proto.CertificateRequest.fromObject(object.certificateRequest);
                }
                return message;
            };

            /**
             * Creates a plain object from an OpAMPConnectionSettingsRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.OpAMPConnectionSettingsRequest
             * @static
             * @param {opamp.proto.OpAMPConnectionSettingsRequest} message OpAMPConnectionSettingsRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            OpAMPConnectionSettingsRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.certificateRequest = null;
                if (message.certificateRequest != null && message.hasOwnProperty("certificateRequest"))
                    object.certificateRequest = $root.opamp.proto.CertificateRequest.toObject(message.certificateRequest, options);
                return object;
            };

            /**
             * Converts this OpAMPConnectionSettingsRequest to JSON.
             * @function toJSON
             * @memberof opamp.proto.OpAMPConnectionSettingsRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            OpAMPConnectionSettingsRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for OpAMPConnectionSettingsRequest
             * @function getTypeUrl
             * @memberof opamp.proto.OpAMPConnectionSettingsRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            OpAMPConnectionSettingsRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.OpAMPConnectionSettingsRequest";
            };

            return OpAMPConnectionSettingsRequest;
        })();

        proto.CertificateRequest = (function() {

            /**
             * Properties of a CertificateRequest.
             * @memberof opamp.proto
             * @interface ICertificateRequest
             * @property {Uint8Array|null} [csr] CertificateRequest csr
             */

            /**
             * Constructs a new CertificateRequest.
             * @memberof opamp.proto
             * @classdesc Represents a CertificateRequest.
             * @implements ICertificateRequest
             * @constructor
             * @param {opamp.proto.ICertificateRequest=} [properties] Properties to set
             */
            function CertificateRequest(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * CertificateRequest csr.
             * @member {Uint8Array} csr
             * @memberof opamp.proto.CertificateRequest
             * @instance
             */
            CertificateRequest.prototype.csr = $util.newBuffer([]);

            /**
             * Creates a new CertificateRequest instance using the specified properties.
             * @function create
             * @memberof opamp.proto.CertificateRequest
             * @static
             * @param {opamp.proto.ICertificateRequest=} [properties] Properties to set
             * @returns {opamp.proto.CertificateRequest} CertificateRequest instance
             */
            CertificateRequest.create = function create(properties) {
                return new CertificateRequest(properties);
            };

            /**
             * Encodes the specified CertificateRequest message. Does not implicitly {@link opamp.proto.CertificateRequest.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.CertificateRequest
             * @static
             * @param {opamp.proto.ICertificateRequest} message CertificateRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CertificateRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.csr != null && Object.hasOwnProperty.call(message, "csr"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.csr);
                return writer;
            };

            /**
             * Encodes the specified CertificateRequest message, length delimited. Does not implicitly {@link opamp.proto.CertificateRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.CertificateRequest
             * @static
             * @param {opamp.proto.ICertificateRequest} message CertificateRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CertificateRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CertificateRequest message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.CertificateRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.CertificateRequest} CertificateRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CertificateRequest.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.CertificateRequest();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.csr = reader.bytes();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a CertificateRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.CertificateRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.CertificateRequest} CertificateRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CertificateRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a CertificateRequest message.
             * @function verify
             * @memberof opamp.proto.CertificateRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CertificateRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.csr != null && message.hasOwnProperty("csr"))
                    if (!(message.csr && typeof message.csr.length === "number" || $util.isString(message.csr)))
                        return "csr: buffer expected";
                return null;
            };

            /**
             * Creates a CertificateRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.CertificateRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.CertificateRequest} CertificateRequest
             */
            CertificateRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.CertificateRequest)
                    return object;
                var message = new $root.opamp.proto.CertificateRequest();
                if (object.csr != null)
                    if (typeof object.csr === "string")
                        $util.base64.decode(object.csr, message.csr = $util.newBuffer($util.base64.length(object.csr)), 0);
                    else if (object.csr.length >= 0)
                        message.csr = object.csr;
                return message;
            };

            /**
             * Creates a plain object from a CertificateRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.CertificateRequest
             * @static
             * @param {opamp.proto.CertificateRequest} message CertificateRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            CertificateRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    if (options.bytes === String)
                        object.csr = "";
                    else {
                        object.csr = [];
                        if (options.bytes !== Array)
                            object.csr = $util.newBuffer(object.csr);
                    }
                if (message.csr != null && message.hasOwnProperty("csr"))
                    object.csr = options.bytes === String ? $util.base64.encode(message.csr, 0, message.csr.length) : options.bytes === Array ? Array.prototype.slice.call(message.csr) : message.csr;
                return object;
            };

            /**
             * Converts this CertificateRequest to JSON.
             * @function toJSON
             * @memberof opamp.proto.CertificateRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CertificateRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for CertificateRequest
             * @function getTypeUrl
             * @memberof opamp.proto.CertificateRequest
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            CertificateRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.CertificateRequest";
            };

            return CertificateRequest;
        })();

        proto.AvailableComponents = (function() {

            /**
             * Properties of an AvailableComponents.
             * @memberof opamp.proto
             * @interface IAvailableComponents
             * @property {Object.<string,opamp.proto.IComponentDetails>|null} [components] AvailableComponents components
             * @property {Uint8Array|null} [hash] AvailableComponents hash
             */

            /**
             * Constructs a new AvailableComponents.
             * @memberof opamp.proto
             * @classdesc Represents an AvailableComponents.
             * @implements IAvailableComponents
             * @constructor
             * @param {opamp.proto.IAvailableComponents=} [properties] Properties to set
             */
            function AvailableComponents(properties) {
                this.components = {};
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * AvailableComponents components.
             * @member {Object.<string,opamp.proto.IComponentDetails>} components
             * @memberof opamp.proto.AvailableComponents
             * @instance
             */
            AvailableComponents.prototype.components = $util.emptyObject;

            /**
             * AvailableComponents hash.
             * @member {Uint8Array} hash
             * @memberof opamp.proto.AvailableComponents
             * @instance
             */
            AvailableComponents.prototype.hash = $util.newBuffer([]);

            /**
             * Creates a new AvailableComponents instance using the specified properties.
             * @function create
             * @memberof opamp.proto.AvailableComponents
             * @static
             * @param {opamp.proto.IAvailableComponents=} [properties] Properties to set
             * @returns {opamp.proto.AvailableComponents} AvailableComponents instance
             */
            AvailableComponents.create = function create(properties) {
                return new AvailableComponents(properties);
            };

            /**
             * Encodes the specified AvailableComponents message. Does not implicitly {@link opamp.proto.AvailableComponents.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.AvailableComponents
             * @static
             * @param {opamp.proto.IAvailableComponents} message AvailableComponents message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AvailableComponents.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.components != null && Object.hasOwnProperty.call(message, "components"))
                    for (var keys = Object.keys(message.components), i = 0; i < keys.length; ++i) {
                        writer.uint32(/* id 1, wireType 2 =*/10).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                        $root.opamp.proto.ComponentDetails.encode(message.components[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                    }
                if (message.hash != null && Object.hasOwnProperty.call(message, "hash"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.hash);
                return writer;
            };

            /**
             * Encodes the specified AvailableComponents message, length delimited. Does not implicitly {@link opamp.proto.AvailableComponents.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.AvailableComponents
             * @static
             * @param {opamp.proto.IAvailableComponents} message AvailableComponents message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AvailableComponents.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an AvailableComponents message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.AvailableComponents
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.AvailableComponents} AvailableComponents
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AvailableComponents.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.AvailableComponents(), key, value;
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (message.components === $util.emptyObject)
                                message.components = {};
                            var end2 = reader.uint32() + reader.pos;
                            key = "";
                            value = null;
                            while (reader.pos < end2) {
                                var tag2 = reader.uint32();
                                switch (tag2 >>> 3) {
                                case 1:
                                    key = reader.string();
                                    break;
                                case 2:
                                    value = $root.opamp.proto.ComponentDetails.decode(reader, reader.uint32());
                                    break;
                                default:
                                    reader.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            message.components[key] = value;
                            break;
                        }
                    case 2: {
                            message.hash = reader.bytes();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an AvailableComponents message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.AvailableComponents
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.AvailableComponents} AvailableComponents
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AvailableComponents.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an AvailableComponents message.
             * @function verify
             * @memberof opamp.proto.AvailableComponents
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            AvailableComponents.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.components != null && message.hasOwnProperty("components")) {
                    if (!$util.isObject(message.components))
                        return "components: object expected";
                    var key = Object.keys(message.components);
                    for (var i = 0; i < key.length; ++i) {
                        var error = $root.opamp.proto.ComponentDetails.verify(message.components[key[i]]);
                        if (error)
                            return "components." + error;
                    }
                }
                if (message.hash != null && message.hasOwnProperty("hash"))
                    if (!(message.hash && typeof message.hash.length === "number" || $util.isString(message.hash)))
                        return "hash: buffer expected";
                return null;
            };

            /**
             * Creates an AvailableComponents message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.AvailableComponents
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.AvailableComponents} AvailableComponents
             */
            AvailableComponents.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.AvailableComponents)
                    return object;
                var message = new $root.opamp.proto.AvailableComponents();
                if (object.components) {
                    if (typeof object.components !== "object")
                        throw TypeError(".opamp.proto.AvailableComponents.components: object expected");
                    message.components = {};
                    for (var keys = Object.keys(object.components), i = 0; i < keys.length; ++i) {
                        if (typeof object.components[keys[i]] !== "object")
                            throw TypeError(".opamp.proto.AvailableComponents.components: object expected");
                        message.components[keys[i]] = $root.opamp.proto.ComponentDetails.fromObject(object.components[keys[i]]);
                    }
                }
                if (object.hash != null)
                    if (typeof object.hash === "string")
                        $util.base64.decode(object.hash, message.hash = $util.newBuffer($util.base64.length(object.hash)), 0);
                    else if (object.hash.length >= 0)
                        message.hash = object.hash;
                return message;
            };

            /**
             * Creates a plain object from an AvailableComponents message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.AvailableComponents
             * @static
             * @param {opamp.proto.AvailableComponents} message AvailableComponents
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            AvailableComponents.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.objects || options.defaults)
                    object.components = {};
                if (options.defaults)
                    if (options.bytes === String)
                        object.hash = "";
                    else {
                        object.hash = [];
                        if (options.bytes !== Array)
                            object.hash = $util.newBuffer(object.hash);
                    }
                var keys2;
                if (message.components && (keys2 = Object.keys(message.components)).length) {
                    object.components = {};
                    for (var j = 0; j < keys2.length; ++j)
                        object.components[keys2[j]] = $root.opamp.proto.ComponentDetails.toObject(message.components[keys2[j]], options);
                }
                if (message.hash != null && message.hasOwnProperty("hash"))
                    object.hash = options.bytes === String ? $util.base64.encode(message.hash, 0, message.hash.length) : options.bytes === Array ? Array.prototype.slice.call(message.hash) : message.hash;
                return object;
            };

            /**
             * Converts this AvailableComponents to JSON.
             * @function toJSON
             * @memberof opamp.proto.AvailableComponents
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            AvailableComponents.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for AvailableComponents
             * @function getTypeUrl
             * @memberof opamp.proto.AvailableComponents
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            AvailableComponents.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.AvailableComponents";
            };

            return AvailableComponents;
        })();

        proto.ComponentDetails = (function() {

            /**
             * Properties of a ComponentDetails.
             * @memberof opamp.proto
             * @interface IComponentDetails
             * @property {Array.<opamp.proto.IKeyValue>|null} [metadata] ComponentDetails metadata
             * @property {Object.<string,opamp.proto.IComponentDetails>|null} [subComponentMap] ComponentDetails subComponentMap
             */

            /**
             * Constructs a new ComponentDetails.
             * @memberof opamp.proto
             * @classdesc Represents a ComponentDetails.
             * @implements IComponentDetails
             * @constructor
             * @param {opamp.proto.IComponentDetails=} [properties] Properties to set
             */
            function ComponentDetails(properties) {
                this.metadata = [];
                this.subComponentMap = {};
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ComponentDetails metadata.
             * @member {Array.<opamp.proto.IKeyValue>} metadata
             * @memberof opamp.proto.ComponentDetails
             * @instance
             */
            ComponentDetails.prototype.metadata = $util.emptyArray;

            /**
             * ComponentDetails subComponentMap.
             * @member {Object.<string,opamp.proto.IComponentDetails>} subComponentMap
             * @memberof opamp.proto.ComponentDetails
             * @instance
             */
            ComponentDetails.prototype.subComponentMap = $util.emptyObject;

            /**
             * Creates a new ComponentDetails instance using the specified properties.
             * @function create
             * @memberof opamp.proto.ComponentDetails
             * @static
             * @param {opamp.proto.IComponentDetails=} [properties] Properties to set
             * @returns {opamp.proto.ComponentDetails} ComponentDetails instance
             */
            ComponentDetails.create = function create(properties) {
                return new ComponentDetails(properties);
            };

            /**
             * Encodes the specified ComponentDetails message. Does not implicitly {@link opamp.proto.ComponentDetails.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.ComponentDetails
             * @static
             * @param {opamp.proto.IComponentDetails} message ComponentDetails message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ComponentDetails.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.metadata != null && message.metadata.length)
                    for (var i = 0; i < message.metadata.length; ++i)
                        $root.opamp.proto.KeyValue.encode(message.metadata[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.subComponentMap != null && Object.hasOwnProperty.call(message, "subComponentMap"))
                    for (var keys = Object.keys(message.subComponentMap), i = 0; i < keys.length; ++i) {
                        writer.uint32(/* id 2, wireType 2 =*/18).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                        $root.opamp.proto.ComponentDetails.encode(message.subComponentMap[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                    }
                return writer;
            };

            /**
             * Encodes the specified ComponentDetails message, length delimited. Does not implicitly {@link opamp.proto.ComponentDetails.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.ComponentDetails
             * @static
             * @param {opamp.proto.IComponentDetails} message ComponentDetails message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ComponentDetails.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ComponentDetails message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.ComponentDetails
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.ComponentDetails} ComponentDetails
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ComponentDetails.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.ComponentDetails(), key, value;
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.metadata && message.metadata.length))
                                message.metadata = [];
                            message.metadata.push($root.opamp.proto.KeyValue.decode(reader, reader.uint32()));
                            break;
                        }
                    case 2: {
                            if (message.subComponentMap === $util.emptyObject)
                                message.subComponentMap = {};
                            var end2 = reader.uint32() + reader.pos;
                            key = "";
                            value = null;
                            while (reader.pos < end2) {
                                var tag2 = reader.uint32();
                                switch (tag2 >>> 3) {
                                case 1:
                                    key = reader.string();
                                    break;
                                case 2:
                                    value = $root.opamp.proto.ComponentDetails.decode(reader, reader.uint32());
                                    break;
                                default:
                                    reader.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            message.subComponentMap[key] = value;
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ComponentDetails message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.ComponentDetails
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.ComponentDetails} ComponentDetails
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ComponentDetails.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ComponentDetails message.
             * @function verify
             * @memberof opamp.proto.ComponentDetails
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ComponentDetails.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.metadata != null && message.hasOwnProperty("metadata")) {
                    if (!Array.isArray(message.metadata))
                        return "metadata: array expected";
                    for (var i = 0; i < message.metadata.length; ++i) {
                        var error = $root.opamp.proto.KeyValue.verify(message.metadata[i]);
                        if (error)
                            return "metadata." + error;
                    }
                }
                if (message.subComponentMap != null && message.hasOwnProperty("subComponentMap")) {
                    if (!$util.isObject(message.subComponentMap))
                        return "subComponentMap: object expected";
                    var key = Object.keys(message.subComponentMap);
                    for (var i = 0; i < key.length; ++i) {
                        var error = $root.opamp.proto.ComponentDetails.verify(message.subComponentMap[key[i]]);
                        if (error)
                            return "subComponentMap." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a ComponentDetails message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.ComponentDetails
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.ComponentDetails} ComponentDetails
             */
            ComponentDetails.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.ComponentDetails)
                    return object;
                var message = new $root.opamp.proto.ComponentDetails();
                if (object.metadata) {
                    if (!Array.isArray(object.metadata))
                        throw TypeError(".opamp.proto.ComponentDetails.metadata: array expected");
                    message.metadata = [];
                    for (var i = 0; i < object.metadata.length; ++i) {
                        if (typeof object.metadata[i] !== "object")
                            throw TypeError(".opamp.proto.ComponentDetails.metadata: object expected");
                        message.metadata[i] = $root.opamp.proto.KeyValue.fromObject(object.metadata[i]);
                    }
                }
                if (object.subComponentMap) {
                    if (typeof object.subComponentMap !== "object")
                        throw TypeError(".opamp.proto.ComponentDetails.subComponentMap: object expected");
                    message.subComponentMap = {};
                    for (var keys = Object.keys(object.subComponentMap), i = 0; i < keys.length; ++i) {
                        if (typeof object.subComponentMap[keys[i]] !== "object")
                            throw TypeError(".opamp.proto.ComponentDetails.subComponentMap: object expected");
                        message.subComponentMap[keys[i]] = $root.opamp.proto.ComponentDetails.fromObject(object.subComponentMap[keys[i]]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a ComponentDetails message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.ComponentDetails
             * @static
             * @param {opamp.proto.ComponentDetails} message ComponentDetails
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ComponentDetails.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.metadata = [];
                if (options.objects || options.defaults)
                    object.subComponentMap = {};
                if (message.metadata && message.metadata.length) {
                    object.metadata = [];
                    for (var j = 0; j < message.metadata.length; ++j)
                        object.metadata[j] = $root.opamp.proto.KeyValue.toObject(message.metadata[j], options);
                }
                var keys2;
                if (message.subComponentMap && (keys2 = Object.keys(message.subComponentMap)).length) {
                    object.subComponentMap = {};
                    for (var j = 0; j < keys2.length; ++j)
                        object.subComponentMap[keys2[j]] = $root.opamp.proto.ComponentDetails.toObject(message.subComponentMap[keys2[j]], options);
                }
                return object;
            };

            /**
             * Converts this ComponentDetails to JSON.
             * @function toJSON
             * @memberof opamp.proto.ComponentDetails
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ComponentDetails.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ComponentDetails
             * @function getTypeUrl
             * @memberof opamp.proto.ComponentDetails
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ComponentDetails.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.ComponentDetails";
            };

            return ComponentDetails;
        })();

        proto.ServerToAgent = (function() {

            /**
             * Properties of a ServerToAgent.
             * @memberof opamp.proto
             * @interface IServerToAgent
             * @property {Uint8Array|null} [instanceUid] ServerToAgent instanceUid
             * @property {opamp.proto.IServerErrorResponse|null} [errorResponse] ServerToAgent errorResponse
             * @property {opamp.proto.IAgentRemoteConfig|null} [remoteConfig] ServerToAgent remoteConfig
             * @property {opamp.proto.IConnectionSettingsOffers|null} [connectionSettings] ServerToAgent connectionSettings
             * @property {opamp.proto.IPackagesAvailable|null} [packagesAvailable] ServerToAgent packagesAvailable
             * @property {number|Long|null} [flags] ServerToAgent flags
             * @property {number|Long|null} [capabilities] ServerToAgent capabilities
             * @property {opamp.proto.IAgentIdentification|null} [agentIdentification] ServerToAgent agentIdentification
             * @property {opamp.proto.IServerToAgentCommand|null} [command] ServerToAgent command
             * @property {opamp.proto.ICustomCapabilities|null} [customCapabilities] ServerToAgent customCapabilities
             * @property {opamp.proto.ICustomMessage|null} [customMessage] ServerToAgent customMessage
             */

            /**
             * Constructs a new ServerToAgent.
             * @memberof opamp.proto
             * @classdesc Represents a ServerToAgent.
             * @implements IServerToAgent
             * @constructor
             * @param {opamp.proto.IServerToAgent=} [properties] Properties to set
             */
            function ServerToAgent(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ServerToAgent instanceUid.
             * @member {Uint8Array} instanceUid
             * @memberof opamp.proto.ServerToAgent
             * @instance
             */
            ServerToAgent.prototype.instanceUid = $util.newBuffer([]);

            /**
             * ServerToAgent errorResponse.
             * @member {opamp.proto.IServerErrorResponse|null|undefined} errorResponse
             * @memberof opamp.proto.ServerToAgent
             * @instance
             */
            ServerToAgent.prototype.errorResponse = null;

            /**
             * ServerToAgent remoteConfig.
             * @member {opamp.proto.IAgentRemoteConfig|null|undefined} remoteConfig
             * @memberof opamp.proto.ServerToAgent
             * @instance
             */
            ServerToAgent.prototype.remoteConfig = null;

            /**
             * ServerToAgent connectionSettings.
             * @member {opamp.proto.IConnectionSettingsOffers|null|undefined} connectionSettings
             * @memberof opamp.proto.ServerToAgent
             * @instance
             */
            ServerToAgent.prototype.connectionSettings = null;

            /**
             * ServerToAgent packagesAvailable.
             * @member {opamp.proto.IPackagesAvailable|null|undefined} packagesAvailable
             * @memberof opamp.proto.ServerToAgent
             * @instance
             */
            ServerToAgent.prototype.packagesAvailable = null;

            /**
             * ServerToAgent flags.
             * @member {number|Long} flags
             * @memberof opamp.proto.ServerToAgent
             * @instance
             */
            ServerToAgent.prototype.flags = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * ServerToAgent capabilities.
             * @member {number|Long} capabilities
             * @memberof opamp.proto.ServerToAgent
             * @instance
             */
            ServerToAgent.prototype.capabilities = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * ServerToAgent agentIdentification.
             * @member {opamp.proto.IAgentIdentification|null|undefined} agentIdentification
             * @memberof opamp.proto.ServerToAgent
             * @instance
             */
            ServerToAgent.prototype.agentIdentification = null;

            /**
             * ServerToAgent command.
             * @member {opamp.proto.IServerToAgentCommand|null|undefined} command
             * @memberof opamp.proto.ServerToAgent
             * @instance
             */
            ServerToAgent.prototype.command = null;

            /**
             * ServerToAgent customCapabilities.
             * @member {opamp.proto.ICustomCapabilities|null|undefined} customCapabilities
             * @memberof opamp.proto.ServerToAgent
             * @instance
             */
            ServerToAgent.prototype.customCapabilities = null;

            /**
             * ServerToAgent customMessage.
             * @member {opamp.proto.ICustomMessage|null|undefined} customMessage
             * @memberof opamp.proto.ServerToAgent
             * @instance
             */
            ServerToAgent.prototype.customMessage = null;

            /**
             * Creates a new ServerToAgent instance using the specified properties.
             * @function create
             * @memberof opamp.proto.ServerToAgent
             * @static
             * @param {opamp.proto.IServerToAgent=} [properties] Properties to set
             * @returns {opamp.proto.ServerToAgent} ServerToAgent instance
             */
            ServerToAgent.create = function create(properties) {
                return new ServerToAgent(properties);
            };

            /**
             * Encodes the specified ServerToAgent message. Does not implicitly {@link opamp.proto.ServerToAgent.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.ServerToAgent
             * @static
             * @param {opamp.proto.IServerToAgent} message ServerToAgent message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ServerToAgent.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.instanceUid != null && Object.hasOwnProperty.call(message, "instanceUid"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.instanceUid);
                if (message.errorResponse != null && Object.hasOwnProperty.call(message, "errorResponse"))
                    $root.opamp.proto.ServerErrorResponse.encode(message.errorResponse, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.remoteConfig != null && Object.hasOwnProperty.call(message, "remoteConfig"))
                    $root.opamp.proto.AgentRemoteConfig.encode(message.remoteConfig, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.connectionSettings != null && Object.hasOwnProperty.call(message, "connectionSettings"))
                    $root.opamp.proto.ConnectionSettingsOffers.encode(message.connectionSettings, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                if (message.packagesAvailable != null && Object.hasOwnProperty.call(message, "packagesAvailable"))
                    $root.opamp.proto.PackagesAvailable.encode(message.packagesAvailable, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                if (message.flags != null && Object.hasOwnProperty.call(message, "flags"))
                    writer.uint32(/* id 6, wireType 0 =*/48).uint64(message.flags);
                if (message.capabilities != null && Object.hasOwnProperty.call(message, "capabilities"))
                    writer.uint32(/* id 7, wireType 0 =*/56).uint64(message.capabilities);
                if (message.agentIdentification != null && Object.hasOwnProperty.call(message, "agentIdentification"))
                    $root.opamp.proto.AgentIdentification.encode(message.agentIdentification, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
                if (message.command != null && Object.hasOwnProperty.call(message, "command"))
                    $root.opamp.proto.ServerToAgentCommand.encode(message.command, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
                if (message.customCapabilities != null && Object.hasOwnProperty.call(message, "customCapabilities"))
                    $root.opamp.proto.CustomCapabilities.encode(message.customCapabilities, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
                if (message.customMessage != null && Object.hasOwnProperty.call(message, "customMessage"))
                    $root.opamp.proto.CustomMessage.encode(message.customMessage, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified ServerToAgent message, length delimited. Does not implicitly {@link opamp.proto.ServerToAgent.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.ServerToAgent
             * @static
             * @param {opamp.proto.IServerToAgent} message ServerToAgent message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ServerToAgent.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ServerToAgent message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.ServerToAgent
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.ServerToAgent} ServerToAgent
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ServerToAgent.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.ServerToAgent();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.instanceUid = reader.bytes();
                            break;
                        }
                    case 2: {
                            message.errorResponse = $root.opamp.proto.ServerErrorResponse.decode(reader, reader.uint32());
                            break;
                        }
                    case 3: {
                            message.remoteConfig = $root.opamp.proto.AgentRemoteConfig.decode(reader, reader.uint32());
                            break;
                        }
                    case 4: {
                            message.connectionSettings = $root.opamp.proto.ConnectionSettingsOffers.decode(reader, reader.uint32());
                            break;
                        }
                    case 5: {
                            message.packagesAvailable = $root.opamp.proto.PackagesAvailable.decode(reader, reader.uint32());
                            break;
                        }
                    case 6: {
                            message.flags = reader.uint64();
                            break;
                        }
                    case 7: {
                            message.capabilities = reader.uint64();
                            break;
                        }
                    case 8: {
                            message.agentIdentification = $root.opamp.proto.AgentIdentification.decode(reader, reader.uint32());
                            break;
                        }
                    case 9: {
                            message.command = $root.opamp.proto.ServerToAgentCommand.decode(reader, reader.uint32());
                            break;
                        }
                    case 10: {
                            message.customCapabilities = $root.opamp.proto.CustomCapabilities.decode(reader, reader.uint32());
                            break;
                        }
                    case 11: {
                            message.customMessage = $root.opamp.proto.CustomMessage.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ServerToAgent message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.ServerToAgent
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.ServerToAgent} ServerToAgent
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ServerToAgent.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ServerToAgent message.
             * @function verify
             * @memberof opamp.proto.ServerToAgent
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ServerToAgent.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.instanceUid != null && message.hasOwnProperty("instanceUid"))
                    if (!(message.instanceUid && typeof message.instanceUid.length === "number" || $util.isString(message.instanceUid)))
                        return "instanceUid: buffer expected";
                if (message.errorResponse != null && message.hasOwnProperty("errorResponse")) {
                    var error = $root.opamp.proto.ServerErrorResponse.verify(message.errorResponse);
                    if (error)
                        return "errorResponse." + error;
                }
                if (message.remoteConfig != null && message.hasOwnProperty("remoteConfig")) {
                    var error = $root.opamp.proto.AgentRemoteConfig.verify(message.remoteConfig);
                    if (error)
                        return "remoteConfig." + error;
                }
                if (message.connectionSettings != null && message.hasOwnProperty("connectionSettings")) {
                    var error = $root.opamp.proto.ConnectionSettingsOffers.verify(message.connectionSettings);
                    if (error)
                        return "connectionSettings." + error;
                }
                if (message.packagesAvailable != null && message.hasOwnProperty("packagesAvailable")) {
                    var error = $root.opamp.proto.PackagesAvailable.verify(message.packagesAvailable);
                    if (error)
                        return "packagesAvailable." + error;
                }
                if (message.flags != null && message.hasOwnProperty("flags"))
                    if (!$util.isInteger(message.flags) && !(message.flags && $util.isInteger(message.flags.low) && $util.isInteger(message.flags.high)))
                        return "flags: integer|Long expected";
                if (message.capabilities != null && message.hasOwnProperty("capabilities"))
                    if (!$util.isInteger(message.capabilities) && !(message.capabilities && $util.isInteger(message.capabilities.low) && $util.isInteger(message.capabilities.high)))
                        return "capabilities: integer|Long expected";
                if (message.agentIdentification != null && message.hasOwnProperty("agentIdentification")) {
                    var error = $root.opamp.proto.AgentIdentification.verify(message.agentIdentification);
                    if (error)
                        return "agentIdentification." + error;
                }
                if (message.command != null && message.hasOwnProperty("command")) {
                    var error = $root.opamp.proto.ServerToAgentCommand.verify(message.command);
                    if (error)
                        return "command." + error;
                }
                if (message.customCapabilities != null && message.hasOwnProperty("customCapabilities")) {
                    var error = $root.opamp.proto.CustomCapabilities.verify(message.customCapabilities);
                    if (error)
                        return "customCapabilities." + error;
                }
                if (message.customMessage != null && message.hasOwnProperty("customMessage")) {
                    var error = $root.opamp.proto.CustomMessage.verify(message.customMessage);
                    if (error)
                        return "customMessage." + error;
                }
                return null;
            };

            /**
             * Creates a ServerToAgent message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.ServerToAgent
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.ServerToAgent} ServerToAgent
             */
            ServerToAgent.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.ServerToAgent)
                    return object;
                var message = new $root.opamp.proto.ServerToAgent();
                if (object.instanceUid != null)
                    if (typeof object.instanceUid === "string")
                        $util.base64.decode(object.instanceUid, message.instanceUid = $util.newBuffer($util.base64.length(object.instanceUid)), 0);
                    else if (object.instanceUid.length >= 0)
                        message.instanceUid = object.instanceUid;
                if (object.errorResponse != null) {
                    if (typeof object.errorResponse !== "object")
                        throw TypeError(".opamp.proto.ServerToAgent.errorResponse: object expected");
                    message.errorResponse = $root.opamp.proto.ServerErrorResponse.fromObject(object.errorResponse);
                }
                if (object.remoteConfig != null) {
                    if (typeof object.remoteConfig !== "object")
                        throw TypeError(".opamp.proto.ServerToAgent.remoteConfig: object expected");
                    message.remoteConfig = $root.opamp.proto.AgentRemoteConfig.fromObject(object.remoteConfig);
                }
                if (object.connectionSettings != null) {
                    if (typeof object.connectionSettings !== "object")
                        throw TypeError(".opamp.proto.ServerToAgent.connectionSettings: object expected");
                    message.connectionSettings = $root.opamp.proto.ConnectionSettingsOffers.fromObject(object.connectionSettings);
                }
                if (object.packagesAvailable != null) {
                    if (typeof object.packagesAvailable !== "object")
                        throw TypeError(".opamp.proto.ServerToAgent.packagesAvailable: object expected");
                    message.packagesAvailable = $root.opamp.proto.PackagesAvailable.fromObject(object.packagesAvailable);
                }
                if (object.flags != null)
                    if ($util.Long)
                        (message.flags = $util.Long.fromValue(object.flags)).unsigned = true;
                    else if (typeof object.flags === "string")
                        message.flags = parseInt(object.flags, 10);
                    else if (typeof object.flags === "number")
                        message.flags = object.flags;
                    else if (typeof object.flags === "object")
                        message.flags = new $util.LongBits(object.flags.low >>> 0, object.flags.high >>> 0).toNumber(true);
                if (object.capabilities != null)
                    if ($util.Long)
                        (message.capabilities = $util.Long.fromValue(object.capabilities)).unsigned = true;
                    else if (typeof object.capabilities === "string")
                        message.capabilities = parseInt(object.capabilities, 10);
                    else if (typeof object.capabilities === "number")
                        message.capabilities = object.capabilities;
                    else if (typeof object.capabilities === "object")
                        message.capabilities = new $util.LongBits(object.capabilities.low >>> 0, object.capabilities.high >>> 0).toNumber(true);
                if (object.agentIdentification != null) {
                    if (typeof object.agentIdentification !== "object")
                        throw TypeError(".opamp.proto.ServerToAgent.agentIdentification: object expected");
                    message.agentIdentification = $root.opamp.proto.AgentIdentification.fromObject(object.agentIdentification);
                }
                if (object.command != null) {
                    if (typeof object.command !== "object")
                        throw TypeError(".opamp.proto.ServerToAgent.command: object expected");
                    message.command = $root.opamp.proto.ServerToAgentCommand.fromObject(object.command);
                }
                if (object.customCapabilities != null) {
                    if (typeof object.customCapabilities !== "object")
                        throw TypeError(".opamp.proto.ServerToAgent.customCapabilities: object expected");
                    message.customCapabilities = $root.opamp.proto.CustomCapabilities.fromObject(object.customCapabilities);
                }
                if (object.customMessage != null) {
                    if (typeof object.customMessage !== "object")
                        throw TypeError(".opamp.proto.ServerToAgent.customMessage: object expected");
                    message.customMessage = $root.opamp.proto.CustomMessage.fromObject(object.customMessage);
                }
                return message;
            };

            /**
             * Creates a plain object from a ServerToAgent message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.ServerToAgent
             * @static
             * @param {opamp.proto.ServerToAgent} message ServerToAgent
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ServerToAgent.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    if (options.bytes === String)
                        object.instanceUid = "";
                    else {
                        object.instanceUid = [];
                        if (options.bytes !== Array)
                            object.instanceUid = $util.newBuffer(object.instanceUid);
                    }
                    object.errorResponse = null;
                    object.remoteConfig = null;
                    object.connectionSettings = null;
                    object.packagesAvailable = null;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.flags = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.flags = options.longs === String ? "0" : 0;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.capabilities = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.capabilities = options.longs === String ? "0" : 0;
                    object.agentIdentification = null;
                    object.command = null;
                    object.customCapabilities = null;
                    object.customMessage = null;
                }
                if (message.instanceUid != null && message.hasOwnProperty("instanceUid"))
                    object.instanceUid = options.bytes === String ? $util.base64.encode(message.instanceUid, 0, message.instanceUid.length) : options.bytes === Array ? Array.prototype.slice.call(message.instanceUid) : message.instanceUid;
                if (message.errorResponse != null && message.hasOwnProperty("errorResponse"))
                    object.errorResponse = $root.opamp.proto.ServerErrorResponse.toObject(message.errorResponse, options);
                if (message.remoteConfig != null && message.hasOwnProperty("remoteConfig"))
                    object.remoteConfig = $root.opamp.proto.AgentRemoteConfig.toObject(message.remoteConfig, options);
                if (message.connectionSettings != null && message.hasOwnProperty("connectionSettings"))
                    object.connectionSettings = $root.opamp.proto.ConnectionSettingsOffers.toObject(message.connectionSettings, options);
                if (message.packagesAvailable != null && message.hasOwnProperty("packagesAvailable"))
                    object.packagesAvailable = $root.opamp.proto.PackagesAvailable.toObject(message.packagesAvailable, options);
                if (message.flags != null && message.hasOwnProperty("flags"))
                    if (typeof message.flags === "number")
                        object.flags = options.longs === String ? String(message.flags) : message.flags;
                    else
                        object.flags = options.longs === String ? $util.Long.prototype.toString.call(message.flags) : options.longs === Number ? new $util.LongBits(message.flags.low >>> 0, message.flags.high >>> 0).toNumber(true) : message.flags;
                if (message.capabilities != null && message.hasOwnProperty("capabilities"))
                    if (typeof message.capabilities === "number")
                        object.capabilities = options.longs === String ? String(message.capabilities) : message.capabilities;
                    else
                        object.capabilities = options.longs === String ? $util.Long.prototype.toString.call(message.capabilities) : options.longs === Number ? new $util.LongBits(message.capabilities.low >>> 0, message.capabilities.high >>> 0).toNumber(true) : message.capabilities;
                if (message.agentIdentification != null && message.hasOwnProperty("agentIdentification"))
                    object.agentIdentification = $root.opamp.proto.AgentIdentification.toObject(message.agentIdentification, options);
                if (message.command != null && message.hasOwnProperty("command"))
                    object.command = $root.opamp.proto.ServerToAgentCommand.toObject(message.command, options);
                if (message.customCapabilities != null && message.hasOwnProperty("customCapabilities"))
                    object.customCapabilities = $root.opamp.proto.CustomCapabilities.toObject(message.customCapabilities, options);
                if (message.customMessage != null && message.hasOwnProperty("customMessage"))
                    object.customMessage = $root.opamp.proto.CustomMessage.toObject(message.customMessage, options);
                return object;
            };

            /**
             * Converts this ServerToAgent to JSON.
             * @function toJSON
             * @memberof opamp.proto.ServerToAgent
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ServerToAgent.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ServerToAgent
             * @function getTypeUrl
             * @memberof opamp.proto.ServerToAgent
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ServerToAgent.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.ServerToAgent";
            };

            return ServerToAgent;
        })();

        /**
         * ServerToAgentFlags enum.
         * @name opamp.proto.ServerToAgentFlags
         * @enum {number}
         * @property {number} ServerToAgentFlags_Unspecified=0 ServerToAgentFlags_Unspecified value
         * @property {number} ServerToAgentFlags_ReportFullState=1 ServerToAgentFlags_ReportFullState value
         * @property {number} ServerToAgentFlags_ReportAvailableComponents=2 ServerToAgentFlags_ReportAvailableComponents value
         */
        proto.ServerToAgentFlags = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "ServerToAgentFlags_Unspecified"] = 0;
            values[valuesById[1] = "ServerToAgentFlags_ReportFullState"] = 1;
            values[valuesById[2] = "ServerToAgentFlags_ReportAvailableComponents"] = 2;
            return values;
        })();

        /**
         * ServerCapabilities enum.
         * @name opamp.proto.ServerCapabilities
         * @enum {number}
         * @property {number} ServerCapabilities_Unspecified=0 ServerCapabilities_Unspecified value
         * @property {number} ServerCapabilities_AcceptsStatus=1 ServerCapabilities_AcceptsStatus value
         * @property {number} ServerCapabilities_OffersRemoteConfig=2 ServerCapabilities_OffersRemoteConfig value
         * @property {number} ServerCapabilities_AcceptsEffectiveConfig=4 ServerCapabilities_AcceptsEffectiveConfig value
         * @property {number} ServerCapabilities_OffersPackages=8 ServerCapabilities_OffersPackages value
         * @property {number} ServerCapabilities_AcceptsPackagesStatus=16 ServerCapabilities_AcceptsPackagesStatus value
         * @property {number} ServerCapabilities_OffersConnectionSettings=32 ServerCapabilities_OffersConnectionSettings value
         * @property {number} ServerCapabilities_AcceptsConnectionSettingsRequest=64 ServerCapabilities_AcceptsConnectionSettingsRequest value
         */
        proto.ServerCapabilities = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "ServerCapabilities_Unspecified"] = 0;
            values[valuesById[1] = "ServerCapabilities_AcceptsStatus"] = 1;
            values[valuesById[2] = "ServerCapabilities_OffersRemoteConfig"] = 2;
            values[valuesById[4] = "ServerCapabilities_AcceptsEffectiveConfig"] = 4;
            values[valuesById[8] = "ServerCapabilities_OffersPackages"] = 8;
            values[valuesById[16] = "ServerCapabilities_AcceptsPackagesStatus"] = 16;
            values[valuesById[32] = "ServerCapabilities_OffersConnectionSettings"] = 32;
            values[valuesById[64] = "ServerCapabilities_AcceptsConnectionSettingsRequest"] = 64;
            return values;
        })();

        proto.OpAMPConnectionSettings = (function() {

            /**
             * Properties of an OpAMPConnectionSettings.
             * @memberof opamp.proto
             * @interface IOpAMPConnectionSettings
             * @property {string|null} [destinationEndpoint] OpAMPConnectionSettings destinationEndpoint
             * @property {opamp.proto.IHeaders|null} [headers] OpAMPConnectionSettings headers
             * @property {opamp.proto.ITLSCertificate|null} [certificate] OpAMPConnectionSettings certificate
             * @property {number|Long|null} [heartbeatIntervalSeconds] OpAMPConnectionSettings heartbeatIntervalSeconds
             * @property {opamp.proto.ITLSConnectionSettings|null} [tls] OpAMPConnectionSettings tls
             * @property {opamp.proto.IProxyConnectionSettings|null} [proxy] OpAMPConnectionSettings proxy
             */

            /**
             * Constructs a new OpAMPConnectionSettings.
             * @memberof opamp.proto
             * @classdesc Represents an OpAMPConnectionSettings.
             * @implements IOpAMPConnectionSettings
             * @constructor
             * @param {opamp.proto.IOpAMPConnectionSettings=} [properties] Properties to set
             */
            function OpAMPConnectionSettings(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * OpAMPConnectionSettings destinationEndpoint.
             * @member {string} destinationEndpoint
             * @memberof opamp.proto.OpAMPConnectionSettings
             * @instance
             */
            OpAMPConnectionSettings.prototype.destinationEndpoint = "";

            /**
             * OpAMPConnectionSettings headers.
             * @member {opamp.proto.IHeaders|null|undefined} headers
             * @memberof opamp.proto.OpAMPConnectionSettings
             * @instance
             */
            OpAMPConnectionSettings.prototype.headers = null;

            /**
             * OpAMPConnectionSettings certificate.
             * @member {opamp.proto.ITLSCertificate|null|undefined} certificate
             * @memberof opamp.proto.OpAMPConnectionSettings
             * @instance
             */
            OpAMPConnectionSettings.prototype.certificate = null;

            /**
             * OpAMPConnectionSettings heartbeatIntervalSeconds.
             * @member {number|Long} heartbeatIntervalSeconds
             * @memberof opamp.proto.OpAMPConnectionSettings
             * @instance
             */
            OpAMPConnectionSettings.prototype.heartbeatIntervalSeconds = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * OpAMPConnectionSettings tls.
             * @member {opamp.proto.ITLSConnectionSettings|null|undefined} tls
             * @memberof opamp.proto.OpAMPConnectionSettings
             * @instance
             */
            OpAMPConnectionSettings.prototype.tls = null;

            /**
             * OpAMPConnectionSettings proxy.
             * @member {opamp.proto.IProxyConnectionSettings|null|undefined} proxy
             * @memberof opamp.proto.OpAMPConnectionSettings
             * @instance
             */
            OpAMPConnectionSettings.prototype.proxy = null;

            /**
             * Creates a new OpAMPConnectionSettings instance using the specified properties.
             * @function create
             * @memberof opamp.proto.OpAMPConnectionSettings
             * @static
             * @param {opamp.proto.IOpAMPConnectionSettings=} [properties] Properties to set
             * @returns {opamp.proto.OpAMPConnectionSettings} OpAMPConnectionSettings instance
             */
            OpAMPConnectionSettings.create = function create(properties) {
                return new OpAMPConnectionSettings(properties);
            };

            /**
             * Encodes the specified OpAMPConnectionSettings message. Does not implicitly {@link opamp.proto.OpAMPConnectionSettings.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.OpAMPConnectionSettings
             * @static
             * @param {opamp.proto.IOpAMPConnectionSettings} message OpAMPConnectionSettings message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            OpAMPConnectionSettings.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.destinationEndpoint != null && Object.hasOwnProperty.call(message, "destinationEndpoint"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.destinationEndpoint);
                if (message.headers != null && Object.hasOwnProperty.call(message, "headers"))
                    $root.opamp.proto.Headers.encode(message.headers, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.certificate != null && Object.hasOwnProperty.call(message, "certificate"))
                    $root.opamp.proto.TLSCertificate.encode(message.certificate, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.heartbeatIntervalSeconds != null && Object.hasOwnProperty.call(message, "heartbeatIntervalSeconds"))
                    writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.heartbeatIntervalSeconds);
                if (message.tls != null && Object.hasOwnProperty.call(message, "tls"))
                    $root.opamp.proto.TLSConnectionSettings.encode(message.tls, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                if (message.proxy != null && Object.hasOwnProperty.call(message, "proxy"))
                    $root.opamp.proto.ProxyConnectionSettings.encode(message.proxy, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified OpAMPConnectionSettings message, length delimited. Does not implicitly {@link opamp.proto.OpAMPConnectionSettings.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.OpAMPConnectionSettings
             * @static
             * @param {opamp.proto.IOpAMPConnectionSettings} message OpAMPConnectionSettings message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            OpAMPConnectionSettings.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an OpAMPConnectionSettings message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.OpAMPConnectionSettings
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.OpAMPConnectionSettings} OpAMPConnectionSettings
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            OpAMPConnectionSettings.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.OpAMPConnectionSettings();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.destinationEndpoint = reader.string();
                            break;
                        }
                    case 2: {
                            message.headers = $root.opamp.proto.Headers.decode(reader, reader.uint32());
                            break;
                        }
                    case 3: {
                            message.certificate = $root.opamp.proto.TLSCertificate.decode(reader, reader.uint32());
                            break;
                        }
                    case 4: {
                            message.heartbeatIntervalSeconds = reader.uint64();
                            break;
                        }
                    case 5: {
                            message.tls = $root.opamp.proto.TLSConnectionSettings.decode(reader, reader.uint32());
                            break;
                        }
                    case 6: {
                            message.proxy = $root.opamp.proto.ProxyConnectionSettings.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an OpAMPConnectionSettings message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.OpAMPConnectionSettings
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.OpAMPConnectionSettings} OpAMPConnectionSettings
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            OpAMPConnectionSettings.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an OpAMPConnectionSettings message.
             * @function verify
             * @memberof opamp.proto.OpAMPConnectionSettings
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            OpAMPConnectionSettings.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.destinationEndpoint != null && message.hasOwnProperty("destinationEndpoint"))
                    if (!$util.isString(message.destinationEndpoint))
                        return "destinationEndpoint: string expected";
                if (message.headers != null && message.hasOwnProperty("headers")) {
                    var error = $root.opamp.proto.Headers.verify(message.headers);
                    if (error)
                        return "headers." + error;
                }
                if (message.certificate != null && message.hasOwnProperty("certificate")) {
                    var error = $root.opamp.proto.TLSCertificate.verify(message.certificate);
                    if (error)
                        return "certificate." + error;
                }
                if (message.heartbeatIntervalSeconds != null && message.hasOwnProperty("heartbeatIntervalSeconds"))
                    if (!$util.isInteger(message.heartbeatIntervalSeconds) && !(message.heartbeatIntervalSeconds && $util.isInteger(message.heartbeatIntervalSeconds.low) && $util.isInteger(message.heartbeatIntervalSeconds.high)))
                        return "heartbeatIntervalSeconds: integer|Long expected";
                if (message.tls != null && message.hasOwnProperty("tls")) {
                    var error = $root.opamp.proto.TLSConnectionSettings.verify(message.tls);
                    if (error)
                        return "tls." + error;
                }
                if (message.proxy != null && message.hasOwnProperty("proxy")) {
                    var error = $root.opamp.proto.ProxyConnectionSettings.verify(message.proxy);
                    if (error)
                        return "proxy." + error;
                }
                return null;
            };

            /**
             * Creates an OpAMPConnectionSettings message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.OpAMPConnectionSettings
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.OpAMPConnectionSettings} OpAMPConnectionSettings
             */
            OpAMPConnectionSettings.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.OpAMPConnectionSettings)
                    return object;
                var message = new $root.opamp.proto.OpAMPConnectionSettings();
                if (object.destinationEndpoint != null)
                    message.destinationEndpoint = String(object.destinationEndpoint);
                if (object.headers != null) {
                    if (typeof object.headers !== "object")
                        throw TypeError(".opamp.proto.OpAMPConnectionSettings.headers: object expected");
                    message.headers = $root.opamp.proto.Headers.fromObject(object.headers);
                }
                if (object.certificate != null) {
                    if (typeof object.certificate !== "object")
                        throw TypeError(".opamp.proto.OpAMPConnectionSettings.certificate: object expected");
                    message.certificate = $root.opamp.proto.TLSCertificate.fromObject(object.certificate);
                }
                if (object.heartbeatIntervalSeconds != null)
                    if ($util.Long)
                        (message.heartbeatIntervalSeconds = $util.Long.fromValue(object.heartbeatIntervalSeconds)).unsigned = true;
                    else if (typeof object.heartbeatIntervalSeconds === "string")
                        message.heartbeatIntervalSeconds = parseInt(object.heartbeatIntervalSeconds, 10);
                    else if (typeof object.heartbeatIntervalSeconds === "number")
                        message.heartbeatIntervalSeconds = object.heartbeatIntervalSeconds;
                    else if (typeof object.heartbeatIntervalSeconds === "object")
                        message.heartbeatIntervalSeconds = new $util.LongBits(object.heartbeatIntervalSeconds.low >>> 0, object.heartbeatIntervalSeconds.high >>> 0).toNumber(true);
                if (object.tls != null) {
                    if (typeof object.tls !== "object")
                        throw TypeError(".opamp.proto.OpAMPConnectionSettings.tls: object expected");
                    message.tls = $root.opamp.proto.TLSConnectionSettings.fromObject(object.tls);
                }
                if (object.proxy != null) {
                    if (typeof object.proxy !== "object")
                        throw TypeError(".opamp.proto.OpAMPConnectionSettings.proxy: object expected");
                    message.proxy = $root.opamp.proto.ProxyConnectionSettings.fromObject(object.proxy);
                }
                return message;
            };

            /**
             * Creates a plain object from an OpAMPConnectionSettings message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.OpAMPConnectionSettings
             * @static
             * @param {opamp.proto.OpAMPConnectionSettings} message OpAMPConnectionSettings
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            OpAMPConnectionSettings.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.destinationEndpoint = "";
                    object.headers = null;
                    object.certificate = null;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.heartbeatIntervalSeconds = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.heartbeatIntervalSeconds = options.longs === String ? "0" : 0;
                    object.tls = null;
                    object.proxy = null;
                }
                if (message.destinationEndpoint != null && message.hasOwnProperty("destinationEndpoint"))
                    object.destinationEndpoint = message.destinationEndpoint;
                if (message.headers != null && message.hasOwnProperty("headers"))
                    object.headers = $root.opamp.proto.Headers.toObject(message.headers, options);
                if (message.certificate != null && message.hasOwnProperty("certificate"))
                    object.certificate = $root.opamp.proto.TLSCertificate.toObject(message.certificate, options);
                if (message.heartbeatIntervalSeconds != null && message.hasOwnProperty("heartbeatIntervalSeconds"))
                    if (typeof message.heartbeatIntervalSeconds === "number")
                        object.heartbeatIntervalSeconds = options.longs === String ? String(message.heartbeatIntervalSeconds) : message.heartbeatIntervalSeconds;
                    else
                        object.heartbeatIntervalSeconds = options.longs === String ? $util.Long.prototype.toString.call(message.heartbeatIntervalSeconds) : options.longs === Number ? new $util.LongBits(message.heartbeatIntervalSeconds.low >>> 0, message.heartbeatIntervalSeconds.high >>> 0).toNumber(true) : message.heartbeatIntervalSeconds;
                if (message.tls != null && message.hasOwnProperty("tls"))
                    object.tls = $root.opamp.proto.TLSConnectionSettings.toObject(message.tls, options);
                if (message.proxy != null && message.hasOwnProperty("proxy"))
                    object.proxy = $root.opamp.proto.ProxyConnectionSettings.toObject(message.proxy, options);
                return object;
            };

            /**
             * Converts this OpAMPConnectionSettings to JSON.
             * @function toJSON
             * @memberof opamp.proto.OpAMPConnectionSettings
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            OpAMPConnectionSettings.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for OpAMPConnectionSettings
             * @function getTypeUrl
             * @memberof opamp.proto.OpAMPConnectionSettings
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            OpAMPConnectionSettings.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.OpAMPConnectionSettings";
            };

            return OpAMPConnectionSettings;
        })();

        proto.TelemetryConnectionSettings = (function() {

            /**
             * Properties of a TelemetryConnectionSettings.
             * @memberof opamp.proto
             * @interface ITelemetryConnectionSettings
             * @property {string|null} [destinationEndpoint] TelemetryConnectionSettings destinationEndpoint
             * @property {opamp.proto.IHeaders|null} [headers] TelemetryConnectionSettings headers
             * @property {opamp.proto.ITLSCertificate|null} [certificate] TelemetryConnectionSettings certificate
             * @property {opamp.proto.ITLSConnectionSettings|null} [tls] TelemetryConnectionSettings tls
             * @property {opamp.proto.IProxyConnectionSettings|null} [proxy] TelemetryConnectionSettings proxy
             */

            /**
             * Constructs a new TelemetryConnectionSettings.
             * @memberof opamp.proto
             * @classdesc Represents a TelemetryConnectionSettings.
             * @implements ITelemetryConnectionSettings
             * @constructor
             * @param {opamp.proto.ITelemetryConnectionSettings=} [properties] Properties to set
             */
            function TelemetryConnectionSettings(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * TelemetryConnectionSettings destinationEndpoint.
             * @member {string} destinationEndpoint
             * @memberof opamp.proto.TelemetryConnectionSettings
             * @instance
             */
            TelemetryConnectionSettings.prototype.destinationEndpoint = "";

            /**
             * TelemetryConnectionSettings headers.
             * @member {opamp.proto.IHeaders|null|undefined} headers
             * @memberof opamp.proto.TelemetryConnectionSettings
             * @instance
             */
            TelemetryConnectionSettings.prototype.headers = null;

            /**
             * TelemetryConnectionSettings certificate.
             * @member {opamp.proto.ITLSCertificate|null|undefined} certificate
             * @memberof opamp.proto.TelemetryConnectionSettings
             * @instance
             */
            TelemetryConnectionSettings.prototype.certificate = null;

            /**
             * TelemetryConnectionSettings tls.
             * @member {opamp.proto.ITLSConnectionSettings|null|undefined} tls
             * @memberof opamp.proto.TelemetryConnectionSettings
             * @instance
             */
            TelemetryConnectionSettings.prototype.tls = null;

            /**
             * TelemetryConnectionSettings proxy.
             * @member {opamp.proto.IProxyConnectionSettings|null|undefined} proxy
             * @memberof opamp.proto.TelemetryConnectionSettings
             * @instance
             */
            TelemetryConnectionSettings.prototype.proxy = null;

            /**
             * Creates a new TelemetryConnectionSettings instance using the specified properties.
             * @function create
             * @memberof opamp.proto.TelemetryConnectionSettings
             * @static
             * @param {opamp.proto.ITelemetryConnectionSettings=} [properties] Properties to set
             * @returns {opamp.proto.TelemetryConnectionSettings} TelemetryConnectionSettings instance
             */
            TelemetryConnectionSettings.create = function create(properties) {
                return new TelemetryConnectionSettings(properties);
            };

            /**
             * Encodes the specified TelemetryConnectionSettings message. Does not implicitly {@link opamp.proto.TelemetryConnectionSettings.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.TelemetryConnectionSettings
             * @static
             * @param {opamp.proto.ITelemetryConnectionSettings} message TelemetryConnectionSettings message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TelemetryConnectionSettings.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.destinationEndpoint != null && Object.hasOwnProperty.call(message, "destinationEndpoint"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.destinationEndpoint);
                if (message.headers != null && Object.hasOwnProperty.call(message, "headers"))
                    $root.opamp.proto.Headers.encode(message.headers, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.certificate != null && Object.hasOwnProperty.call(message, "certificate"))
                    $root.opamp.proto.TLSCertificate.encode(message.certificate, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.tls != null && Object.hasOwnProperty.call(message, "tls"))
                    $root.opamp.proto.TLSConnectionSettings.encode(message.tls, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                if (message.proxy != null && Object.hasOwnProperty.call(message, "proxy"))
                    $root.opamp.proto.ProxyConnectionSettings.encode(message.proxy, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified TelemetryConnectionSettings message, length delimited. Does not implicitly {@link opamp.proto.TelemetryConnectionSettings.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.TelemetryConnectionSettings
             * @static
             * @param {opamp.proto.ITelemetryConnectionSettings} message TelemetryConnectionSettings message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TelemetryConnectionSettings.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a TelemetryConnectionSettings message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.TelemetryConnectionSettings
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.TelemetryConnectionSettings} TelemetryConnectionSettings
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TelemetryConnectionSettings.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.TelemetryConnectionSettings();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.destinationEndpoint = reader.string();
                            break;
                        }
                    case 2: {
                            message.headers = $root.opamp.proto.Headers.decode(reader, reader.uint32());
                            break;
                        }
                    case 3: {
                            message.certificate = $root.opamp.proto.TLSCertificate.decode(reader, reader.uint32());
                            break;
                        }
                    case 4: {
                            message.tls = $root.opamp.proto.TLSConnectionSettings.decode(reader, reader.uint32());
                            break;
                        }
                    case 5: {
                            message.proxy = $root.opamp.proto.ProxyConnectionSettings.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a TelemetryConnectionSettings message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.TelemetryConnectionSettings
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.TelemetryConnectionSettings} TelemetryConnectionSettings
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TelemetryConnectionSettings.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a TelemetryConnectionSettings message.
             * @function verify
             * @memberof opamp.proto.TelemetryConnectionSettings
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            TelemetryConnectionSettings.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.destinationEndpoint != null && message.hasOwnProperty("destinationEndpoint"))
                    if (!$util.isString(message.destinationEndpoint))
                        return "destinationEndpoint: string expected";
                if (message.headers != null && message.hasOwnProperty("headers")) {
                    var error = $root.opamp.proto.Headers.verify(message.headers);
                    if (error)
                        return "headers." + error;
                }
                if (message.certificate != null && message.hasOwnProperty("certificate")) {
                    var error = $root.opamp.proto.TLSCertificate.verify(message.certificate);
                    if (error)
                        return "certificate." + error;
                }
                if (message.tls != null && message.hasOwnProperty("tls")) {
                    var error = $root.opamp.proto.TLSConnectionSettings.verify(message.tls);
                    if (error)
                        return "tls." + error;
                }
                if (message.proxy != null && message.hasOwnProperty("proxy")) {
                    var error = $root.opamp.proto.ProxyConnectionSettings.verify(message.proxy);
                    if (error)
                        return "proxy." + error;
                }
                return null;
            };

            /**
             * Creates a TelemetryConnectionSettings message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.TelemetryConnectionSettings
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.TelemetryConnectionSettings} TelemetryConnectionSettings
             */
            TelemetryConnectionSettings.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.TelemetryConnectionSettings)
                    return object;
                var message = new $root.opamp.proto.TelemetryConnectionSettings();
                if (object.destinationEndpoint != null)
                    message.destinationEndpoint = String(object.destinationEndpoint);
                if (object.headers != null) {
                    if (typeof object.headers !== "object")
                        throw TypeError(".opamp.proto.TelemetryConnectionSettings.headers: object expected");
                    message.headers = $root.opamp.proto.Headers.fromObject(object.headers);
                }
                if (object.certificate != null) {
                    if (typeof object.certificate !== "object")
                        throw TypeError(".opamp.proto.TelemetryConnectionSettings.certificate: object expected");
                    message.certificate = $root.opamp.proto.TLSCertificate.fromObject(object.certificate);
                }
                if (object.tls != null) {
                    if (typeof object.tls !== "object")
                        throw TypeError(".opamp.proto.TelemetryConnectionSettings.tls: object expected");
                    message.tls = $root.opamp.proto.TLSConnectionSettings.fromObject(object.tls);
                }
                if (object.proxy != null) {
                    if (typeof object.proxy !== "object")
                        throw TypeError(".opamp.proto.TelemetryConnectionSettings.proxy: object expected");
                    message.proxy = $root.opamp.proto.ProxyConnectionSettings.fromObject(object.proxy);
                }
                return message;
            };

            /**
             * Creates a plain object from a TelemetryConnectionSettings message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.TelemetryConnectionSettings
             * @static
             * @param {opamp.proto.TelemetryConnectionSettings} message TelemetryConnectionSettings
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            TelemetryConnectionSettings.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.destinationEndpoint = "";
                    object.headers = null;
                    object.certificate = null;
                    object.tls = null;
                    object.proxy = null;
                }
                if (message.destinationEndpoint != null && message.hasOwnProperty("destinationEndpoint"))
                    object.destinationEndpoint = message.destinationEndpoint;
                if (message.headers != null && message.hasOwnProperty("headers"))
                    object.headers = $root.opamp.proto.Headers.toObject(message.headers, options);
                if (message.certificate != null && message.hasOwnProperty("certificate"))
                    object.certificate = $root.opamp.proto.TLSCertificate.toObject(message.certificate, options);
                if (message.tls != null && message.hasOwnProperty("tls"))
                    object.tls = $root.opamp.proto.TLSConnectionSettings.toObject(message.tls, options);
                if (message.proxy != null && message.hasOwnProperty("proxy"))
                    object.proxy = $root.opamp.proto.ProxyConnectionSettings.toObject(message.proxy, options);
                return object;
            };

            /**
             * Converts this TelemetryConnectionSettings to JSON.
             * @function toJSON
             * @memberof opamp.proto.TelemetryConnectionSettings
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            TelemetryConnectionSettings.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for TelemetryConnectionSettings
             * @function getTypeUrl
             * @memberof opamp.proto.TelemetryConnectionSettings
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            TelemetryConnectionSettings.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.TelemetryConnectionSettings";
            };

            return TelemetryConnectionSettings;
        })();

        proto.OtherConnectionSettings = (function() {

            /**
             * Properties of an OtherConnectionSettings.
             * @memberof opamp.proto
             * @interface IOtherConnectionSettings
             * @property {string|null} [destinationEndpoint] OtherConnectionSettings destinationEndpoint
             * @property {opamp.proto.IHeaders|null} [headers] OtherConnectionSettings headers
             * @property {opamp.proto.ITLSCertificate|null} [certificate] OtherConnectionSettings certificate
             * @property {Object.<string,string>|null} [otherSettings] OtherConnectionSettings otherSettings
             * @property {opamp.proto.ITLSConnectionSettings|null} [tls] OtherConnectionSettings tls
             * @property {opamp.proto.IProxyConnectionSettings|null} [proxy] OtherConnectionSettings proxy
             */

            /**
             * Constructs a new OtherConnectionSettings.
             * @memberof opamp.proto
             * @classdesc Represents an OtherConnectionSettings.
             * @implements IOtherConnectionSettings
             * @constructor
             * @param {opamp.proto.IOtherConnectionSettings=} [properties] Properties to set
             */
            function OtherConnectionSettings(properties) {
                this.otherSettings = {};
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * OtherConnectionSettings destinationEndpoint.
             * @member {string} destinationEndpoint
             * @memberof opamp.proto.OtherConnectionSettings
             * @instance
             */
            OtherConnectionSettings.prototype.destinationEndpoint = "";

            /**
             * OtherConnectionSettings headers.
             * @member {opamp.proto.IHeaders|null|undefined} headers
             * @memberof opamp.proto.OtherConnectionSettings
             * @instance
             */
            OtherConnectionSettings.prototype.headers = null;

            /**
             * OtherConnectionSettings certificate.
             * @member {opamp.proto.ITLSCertificate|null|undefined} certificate
             * @memberof opamp.proto.OtherConnectionSettings
             * @instance
             */
            OtherConnectionSettings.prototype.certificate = null;

            /**
             * OtherConnectionSettings otherSettings.
             * @member {Object.<string,string>} otherSettings
             * @memberof opamp.proto.OtherConnectionSettings
             * @instance
             */
            OtherConnectionSettings.prototype.otherSettings = $util.emptyObject;

            /**
             * OtherConnectionSettings tls.
             * @member {opamp.proto.ITLSConnectionSettings|null|undefined} tls
             * @memberof opamp.proto.OtherConnectionSettings
             * @instance
             */
            OtherConnectionSettings.prototype.tls = null;

            /**
             * OtherConnectionSettings proxy.
             * @member {opamp.proto.IProxyConnectionSettings|null|undefined} proxy
             * @memberof opamp.proto.OtherConnectionSettings
             * @instance
             */
            OtherConnectionSettings.prototype.proxy = null;

            /**
             * Creates a new OtherConnectionSettings instance using the specified properties.
             * @function create
             * @memberof opamp.proto.OtherConnectionSettings
             * @static
             * @param {opamp.proto.IOtherConnectionSettings=} [properties] Properties to set
             * @returns {opamp.proto.OtherConnectionSettings} OtherConnectionSettings instance
             */
            OtherConnectionSettings.create = function create(properties) {
                return new OtherConnectionSettings(properties);
            };

            /**
             * Encodes the specified OtherConnectionSettings message. Does not implicitly {@link opamp.proto.OtherConnectionSettings.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.OtherConnectionSettings
             * @static
             * @param {opamp.proto.IOtherConnectionSettings} message OtherConnectionSettings message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            OtherConnectionSettings.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.destinationEndpoint != null && Object.hasOwnProperty.call(message, "destinationEndpoint"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.destinationEndpoint);
                if (message.headers != null && Object.hasOwnProperty.call(message, "headers"))
                    $root.opamp.proto.Headers.encode(message.headers, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.certificate != null && Object.hasOwnProperty.call(message, "certificate"))
                    $root.opamp.proto.TLSCertificate.encode(message.certificate, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.otherSettings != null && Object.hasOwnProperty.call(message, "otherSettings"))
                    for (var keys = Object.keys(message.otherSettings), i = 0; i < keys.length; ++i)
                        writer.uint32(/* id 4, wireType 2 =*/34).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.otherSettings[keys[i]]).ldelim();
                if (message.tls != null && Object.hasOwnProperty.call(message, "tls"))
                    $root.opamp.proto.TLSConnectionSettings.encode(message.tls, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                if (message.proxy != null && Object.hasOwnProperty.call(message, "proxy"))
                    $root.opamp.proto.ProxyConnectionSettings.encode(message.proxy, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified OtherConnectionSettings message, length delimited. Does not implicitly {@link opamp.proto.OtherConnectionSettings.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.OtherConnectionSettings
             * @static
             * @param {opamp.proto.IOtherConnectionSettings} message OtherConnectionSettings message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            OtherConnectionSettings.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an OtherConnectionSettings message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.OtherConnectionSettings
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.OtherConnectionSettings} OtherConnectionSettings
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            OtherConnectionSettings.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.OtherConnectionSettings(), key, value;
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.destinationEndpoint = reader.string();
                            break;
                        }
                    case 2: {
                            message.headers = $root.opamp.proto.Headers.decode(reader, reader.uint32());
                            break;
                        }
                    case 3: {
                            message.certificate = $root.opamp.proto.TLSCertificate.decode(reader, reader.uint32());
                            break;
                        }
                    case 4: {
                            if (message.otherSettings === $util.emptyObject)
                                message.otherSettings = {};
                            var end2 = reader.uint32() + reader.pos;
                            key = "";
                            value = "";
                            while (reader.pos < end2) {
                                var tag2 = reader.uint32();
                                switch (tag2 >>> 3) {
                                case 1:
                                    key = reader.string();
                                    break;
                                case 2:
                                    value = reader.string();
                                    break;
                                default:
                                    reader.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            message.otherSettings[key] = value;
                            break;
                        }
                    case 5: {
                            message.tls = $root.opamp.proto.TLSConnectionSettings.decode(reader, reader.uint32());
                            break;
                        }
                    case 6: {
                            message.proxy = $root.opamp.proto.ProxyConnectionSettings.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an OtherConnectionSettings message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.OtherConnectionSettings
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.OtherConnectionSettings} OtherConnectionSettings
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            OtherConnectionSettings.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an OtherConnectionSettings message.
             * @function verify
             * @memberof opamp.proto.OtherConnectionSettings
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            OtherConnectionSettings.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.destinationEndpoint != null && message.hasOwnProperty("destinationEndpoint"))
                    if (!$util.isString(message.destinationEndpoint))
                        return "destinationEndpoint: string expected";
                if (message.headers != null && message.hasOwnProperty("headers")) {
                    var error = $root.opamp.proto.Headers.verify(message.headers);
                    if (error)
                        return "headers." + error;
                }
                if (message.certificate != null && message.hasOwnProperty("certificate")) {
                    var error = $root.opamp.proto.TLSCertificate.verify(message.certificate);
                    if (error)
                        return "certificate." + error;
                }
                if (message.otherSettings != null && message.hasOwnProperty("otherSettings")) {
                    if (!$util.isObject(message.otherSettings))
                        return "otherSettings: object expected";
                    var key = Object.keys(message.otherSettings);
                    for (var i = 0; i < key.length; ++i)
                        if (!$util.isString(message.otherSettings[key[i]]))
                            return "otherSettings: string{k:string} expected";
                }
                if (message.tls != null && message.hasOwnProperty("tls")) {
                    var error = $root.opamp.proto.TLSConnectionSettings.verify(message.tls);
                    if (error)
                        return "tls." + error;
                }
                if (message.proxy != null && message.hasOwnProperty("proxy")) {
                    var error = $root.opamp.proto.ProxyConnectionSettings.verify(message.proxy);
                    if (error)
                        return "proxy." + error;
                }
                return null;
            };

            /**
             * Creates an OtherConnectionSettings message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.OtherConnectionSettings
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.OtherConnectionSettings} OtherConnectionSettings
             */
            OtherConnectionSettings.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.OtherConnectionSettings)
                    return object;
                var message = new $root.opamp.proto.OtherConnectionSettings();
                if (object.destinationEndpoint != null)
                    message.destinationEndpoint = String(object.destinationEndpoint);
                if (object.headers != null) {
                    if (typeof object.headers !== "object")
                        throw TypeError(".opamp.proto.OtherConnectionSettings.headers: object expected");
                    message.headers = $root.opamp.proto.Headers.fromObject(object.headers);
                }
                if (object.certificate != null) {
                    if (typeof object.certificate !== "object")
                        throw TypeError(".opamp.proto.OtherConnectionSettings.certificate: object expected");
                    message.certificate = $root.opamp.proto.TLSCertificate.fromObject(object.certificate);
                }
                if (object.otherSettings) {
                    if (typeof object.otherSettings !== "object")
                        throw TypeError(".opamp.proto.OtherConnectionSettings.otherSettings: object expected");
                    message.otherSettings = {};
                    for (var keys = Object.keys(object.otherSettings), i = 0; i < keys.length; ++i)
                        message.otherSettings[keys[i]] = String(object.otherSettings[keys[i]]);
                }
                if (object.tls != null) {
                    if (typeof object.tls !== "object")
                        throw TypeError(".opamp.proto.OtherConnectionSettings.tls: object expected");
                    message.tls = $root.opamp.proto.TLSConnectionSettings.fromObject(object.tls);
                }
                if (object.proxy != null) {
                    if (typeof object.proxy !== "object")
                        throw TypeError(".opamp.proto.OtherConnectionSettings.proxy: object expected");
                    message.proxy = $root.opamp.proto.ProxyConnectionSettings.fromObject(object.proxy);
                }
                return message;
            };

            /**
             * Creates a plain object from an OtherConnectionSettings message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.OtherConnectionSettings
             * @static
             * @param {opamp.proto.OtherConnectionSettings} message OtherConnectionSettings
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            OtherConnectionSettings.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.objects || options.defaults)
                    object.otherSettings = {};
                if (options.defaults) {
                    object.destinationEndpoint = "";
                    object.headers = null;
                    object.certificate = null;
                    object.tls = null;
                    object.proxy = null;
                }
                if (message.destinationEndpoint != null && message.hasOwnProperty("destinationEndpoint"))
                    object.destinationEndpoint = message.destinationEndpoint;
                if (message.headers != null && message.hasOwnProperty("headers"))
                    object.headers = $root.opamp.proto.Headers.toObject(message.headers, options);
                if (message.certificate != null && message.hasOwnProperty("certificate"))
                    object.certificate = $root.opamp.proto.TLSCertificate.toObject(message.certificate, options);
                var keys2;
                if (message.otherSettings && (keys2 = Object.keys(message.otherSettings)).length) {
                    object.otherSettings = {};
                    for (var j = 0; j < keys2.length; ++j)
                        object.otherSettings[keys2[j]] = message.otherSettings[keys2[j]];
                }
                if (message.tls != null && message.hasOwnProperty("tls"))
                    object.tls = $root.opamp.proto.TLSConnectionSettings.toObject(message.tls, options);
                if (message.proxy != null && message.hasOwnProperty("proxy"))
                    object.proxy = $root.opamp.proto.ProxyConnectionSettings.toObject(message.proxy, options);
                return object;
            };

            /**
             * Converts this OtherConnectionSettings to JSON.
             * @function toJSON
             * @memberof opamp.proto.OtherConnectionSettings
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            OtherConnectionSettings.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for OtherConnectionSettings
             * @function getTypeUrl
             * @memberof opamp.proto.OtherConnectionSettings
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            OtherConnectionSettings.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.OtherConnectionSettings";
            };

            return OtherConnectionSettings;
        })();

        proto.TLSConnectionSettings = (function() {

            /**
             * Properties of a TLSConnectionSettings.
             * @memberof opamp.proto
             * @interface ITLSConnectionSettings
             * @property {string|null} [caPemContents] TLSConnectionSettings caPemContents
             * @property {boolean|null} [includeSystemCaCertsPool] TLSConnectionSettings includeSystemCaCertsPool
             * @property {boolean|null} [insecureSkipVerify] TLSConnectionSettings insecureSkipVerify
             * @property {string|null} [minVersion] TLSConnectionSettings minVersion
             * @property {string|null} [maxVersion] TLSConnectionSettings maxVersion
             * @property {Array.<string>|null} [cipherSuites] TLSConnectionSettings cipherSuites
             */

            /**
             * Constructs a new TLSConnectionSettings.
             * @memberof opamp.proto
             * @classdesc Represents a TLSConnectionSettings.
             * @implements ITLSConnectionSettings
             * @constructor
             * @param {opamp.proto.ITLSConnectionSettings=} [properties] Properties to set
             */
            function TLSConnectionSettings(properties) {
                this.cipherSuites = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * TLSConnectionSettings caPemContents.
             * @member {string} caPemContents
             * @memberof opamp.proto.TLSConnectionSettings
             * @instance
             */
            TLSConnectionSettings.prototype.caPemContents = "";

            /**
             * TLSConnectionSettings includeSystemCaCertsPool.
             * @member {boolean} includeSystemCaCertsPool
             * @memberof opamp.proto.TLSConnectionSettings
             * @instance
             */
            TLSConnectionSettings.prototype.includeSystemCaCertsPool = false;

            /**
             * TLSConnectionSettings insecureSkipVerify.
             * @member {boolean} insecureSkipVerify
             * @memberof opamp.proto.TLSConnectionSettings
             * @instance
             */
            TLSConnectionSettings.prototype.insecureSkipVerify = false;

            /**
             * TLSConnectionSettings minVersion.
             * @member {string} minVersion
             * @memberof opamp.proto.TLSConnectionSettings
             * @instance
             */
            TLSConnectionSettings.prototype.minVersion = "";

            /**
             * TLSConnectionSettings maxVersion.
             * @member {string} maxVersion
             * @memberof opamp.proto.TLSConnectionSettings
             * @instance
             */
            TLSConnectionSettings.prototype.maxVersion = "";

            /**
             * TLSConnectionSettings cipherSuites.
             * @member {Array.<string>} cipherSuites
             * @memberof opamp.proto.TLSConnectionSettings
             * @instance
             */
            TLSConnectionSettings.prototype.cipherSuites = $util.emptyArray;

            /**
             * Creates a new TLSConnectionSettings instance using the specified properties.
             * @function create
             * @memberof opamp.proto.TLSConnectionSettings
             * @static
             * @param {opamp.proto.ITLSConnectionSettings=} [properties] Properties to set
             * @returns {opamp.proto.TLSConnectionSettings} TLSConnectionSettings instance
             */
            TLSConnectionSettings.create = function create(properties) {
                return new TLSConnectionSettings(properties);
            };

            /**
             * Encodes the specified TLSConnectionSettings message. Does not implicitly {@link opamp.proto.TLSConnectionSettings.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.TLSConnectionSettings
             * @static
             * @param {opamp.proto.ITLSConnectionSettings} message TLSConnectionSettings message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TLSConnectionSettings.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.caPemContents != null && Object.hasOwnProperty.call(message, "caPemContents"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.caPemContents);
                if (message.includeSystemCaCertsPool != null && Object.hasOwnProperty.call(message, "includeSystemCaCertsPool"))
                    writer.uint32(/* id 2, wireType 0 =*/16).bool(message.includeSystemCaCertsPool);
                if (message.insecureSkipVerify != null && Object.hasOwnProperty.call(message, "insecureSkipVerify"))
                    writer.uint32(/* id 3, wireType 0 =*/24).bool(message.insecureSkipVerify);
                if (message.minVersion != null && Object.hasOwnProperty.call(message, "minVersion"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.minVersion);
                if (message.maxVersion != null && Object.hasOwnProperty.call(message, "maxVersion"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.maxVersion);
                if (message.cipherSuites != null && message.cipherSuites.length)
                    for (var i = 0; i < message.cipherSuites.length; ++i)
                        writer.uint32(/* id 6, wireType 2 =*/50).string(message.cipherSuites[i]);
                return writer;
            };

            /**
             * Encodes the specified TLSConnectionSettings message, length delimited. Does not implicitly {@link opamp.proto.TLSConnectionSettings.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.TLSConnectionSettings
             * @static
             * @param {opamp.proto.ITLSConnectionSettings} message TLSConnectionSettings message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TLSConnectionSettings.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a TLSConnectionSettings message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.TLSConnectionSettings
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.TLSConnectionSettings} TLSConnectionSettings
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TLSConnectionSettings.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.TLSConnectionSettings();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.caPemContents = reader.string();
                            break;
                        }
                    case 2: {
                            message.includeSystemCaCertsPool = reader.bool();
                            break;
                        }
                    case 3: {
                            message.insecureSkipVerify = reader.bool();
                            break;
                        }
                    case 4: {
                            message.minVersion = reader.string();
                            break;
                        }
                    case 5: {
                            message.maxVersion = reader.string();
                            break;
                        }
                    case 6: {
                            if (!(message.cipherSuites && message.cipherSuites.length))
                                message.cipherSuites = [];
                            message.cipherSuites.push(reader.string());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a TLSConnectionSettings message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.TLSConnectionSettings
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.TLSConnectionSettings} TLSConnectionSettings
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TLSConnectionSettings.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a TLSConnectionSettings message.
             * @function verify
             * @memberof opamp.proto.TLSConnectionSettings
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            TLSConnectionSettings.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.caPemContents != null && message.hasOwnProperty("caPemContents"))
                    if (!$util.isString(message.caPemContents))
                        return "caPemContents: string expected";
                if (message.includeSystemCaCertsPool != null && message.hasOwnProperty("includeSystemCaCertsPool"))
                    if (typeof message.includeSystemCaCertsPool !== "boolean")
                        return "includeSystemCaCertsPool: boolean expected";
                if (message.insecureSkipVerify != null && message.hasOwnProperty("insecureSkipVerify"))
                    if (typeof message.insecureSkipVerify !== "boolean")
                        return "insecureSkipVerify: boolean expected";
                if (message.minVersion != null && message.hasOwnProperty("minVersion"))
                    if (!$util.isString(message.minVersion))
                        return "minVersion: string expected";
                if (message.maxVersion != null && message.hasOwnProperty("maxVersion"))
                    if (!$util.isString(message.maxVersion))
                        return "maxVersion: string expected";
                if (message.cipherSuites != null && message.hasOwnProperty("cipherSuites")) {
                    if (!Array.isArray(message.cipherSuites))
                        return "cipherSuites: array expected";
                    for (var i = 0; i < message.cipherSuites.length; ++i)
                        if (!$util.isString(message.cipherSuites[i]))
                            return "cipherSuites: string[] expected";
                }
                return null;
            };

            /**
             * Creates a TLSConnectionSettings message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.TLSConnectionSettings
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.TLSConnectionSettings} TLSConnectionSettings
             */
            TLSConnectionSettings.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.TLSConnectionSettings)
                    return object;
                var message = new $root.opamp.proto.TLSConnectionSettings();
                if (object.caPemContents != null)
                    message.caPemContents = String(object.caPemContents);
                if (object.includeSystemCaCertsPool != null)
                    message.includeSystemCaCertsPool = Boolean(object.includeSystemCaCertsPool);
                if (object.insecureSkipVerify != null)
                    message.insecureSkipVerify = Boolean(object.insecureSkipVerify);
                if (object.minVersion != null)
                    message.minVersion = String(object.minVersion);
                if (object.maxVersion != null)
                    message.maxVersion = String(object.maxVersion);
                if (object.cipherSuites) {
                    if (!Array.isArray(object.cipherSuites))
                        throw TypeError(".opamp.proto.TLSConnectionSettings.cipherSuites: array expected");
                    message.cipherSuites = [];
                    for (var i = 0; i < object.cipherSuites.length; ++i)
                        message.cipherSuites[i] = String(object.cipherSuites[i]);
                }
                return message;
            };

            /**
             * Creates a plain object from a TLSConnectionSettings message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.TLSConnectionSettings
             * @static
             * @param {opamp.proto.TLSConnectionSettings} message TLSConnectionSettings
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            TLSConnectionSettings.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.cipherSuites = [];
                if (options.defaults) {
                    object.caPemContents = "";
                    object.includeSystemCaCertsPool = false;
                    object.insecureSkipVerify = false;
                    object.minVersion = "";
                    object.maxVersion = "";
                }
                if (message.caPemContents != null && message.hasOwnProperty("caPemContents"))
                    object.caPemContents = message.caPemContents;
                if (message.includeSystemCaCertsPool != null && message.hasOwnProperty("includeSystemCaCertsPool"))
                    object.includeSystemCaCertsPool = message.includeSystemCaCertsPool;
                if (message.insecureSkipVerify != null && message.hasOwnProperty("insecureSkipVerify"))
                    object.insecureSkipVerify = message.insecureSkipVerify;
                if (message.minVersion != null && message.hasOwnProperty("minVersion"))
                    object.minVersion = message.minVersion;
                if (message.maxVersion != null && message.hasOwnProperty("maxVersion"))
                    object.maxVersion = message.maxVersion;
                if (message.cipherSuites && message.cipherSuites.length) {
                    object.cipherSuites = [];
                    for (var j = 0; j < message.cipherSuites.length; ++j)
                        object.cipherSuites[j] = message.cipherSuites[j];
                }
                return object;
            };

            /**
             * Converts this TLSConnectionSettings to JSON.
             * @function toJSON
             * @memberof opamp.proto.TLSConnectionSettings
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            TLSConnectionSettings.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for TLSConnectionSettings
             * @function getTypeUrl
             * @memberof opamp.proto.TLSConnectionSettings
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            TLSConnectionSettings.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.TLSConnectionSettings";
            };

            return TLSConnectionSettings;
        })();

        proto.ProxyConnectionSettings = (function() {

            /**
             * Properties of a ProxyConnectionSettings.
             * @memberof opamp.proto
             * @interface IProxyConnectionSettings
             * @property {string|null} [url] ProxyConnectionSettings url
             * @property {opamp.proto.IHeaders|null} [connectHeaders] ProxyConnectionSettings connectHeaders
             */

            /**
             * Constructs a new ProxyConnectionSettings.
             * @memberof opamp.proto
             * @classdesc Represents a ProxyConnectionSettings.
             * @implements IProxyConnectionSettings
             * @constructor
             * @param {opamp.proto.IProxyConnectionSettings=} [properties] Properties to set
             */
            function ProxyConnectionSettings(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ProxyConnectionSettings url.
             * @member {string} url
             * @memberof opamp.proto.ProxyConnectionSettings
             * @instance
             */
            ProxyConnectionSettings.prototype.url = "";

            /**
             * ProxyConnectionSettings connectHeaders.
             * @member {opamp.proto.IHeaders|null|undefined} connectHeaders
             * @memberof opamp.proto.ProxyConnectionSettings
             * @instance
             */
            ProxyConnectionSettings.prototype.connectHeaders = null;

            /**
             * Creates a new ProxyConnectionSettings instance using the specified properties.
             * @function create
             * @memberof opamp.proto.ProxyConnectionSettings
             * @static
             * @param {opamp.proto.IProxyConnectionSettings=} [properties] Properties to set
             * @returns {opamp.proto.ProxyConnectionSettings} ProxyConnectionSettings instance
             */
            ProxyConnectionSettings.create = function create(properties) {
                return new ProxyConnectionSettings(properties);
            };

            /**
             * Encodes the specified ProxyConnectionSettings message. Does not implicitly {@link opamp.proto.ProxyConnectionSettings.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.ProxyConnectionSettings
             * @static
             * @param {opamp.proto.IProxyConnectionSettings} message ProxyConnectionSettings message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ProxyConnectionSettings.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.url != null && Object.hasOwnProperty.call(message, "url"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.url);
                if (message.connectHeaders != null && Object.hasOwnProperty.call(message, "connectHeaders"))
                    $root.opamp.proto.Headers.encode(message.connectHeaders, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified ProxyConnectionSettings message, length delimited. Does not implicitly {@link opamp.proto.ProxyConnectionSettings.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.ProxyConnectionSettings
             * @static
             * @param {opamp.proto.IProxyConnectionSettings} message ProxyConnectionSettings message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ProxyConnectionSettings.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ProxyConnectionSettings message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.ProxyConnectionSettings
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.ProxyConnectionSettings} ProxyConnectionSettings
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ProxyConnectionSettings.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.ProxyConnectionSettings();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.url = reader.string();
                            break;
                        }
                    case 2: {
                            message.connectHeaders = $root.opamp.proto.Headers.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ProxyConnectionSettings message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.ProxyConnectionSettings
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.ProxyConnectionSettings} ProxyConnectionSettings
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ProxyConnectionSettings.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ProxyConnectionSettings message.
             * @function verify
             * @memberof opamp.proto.ProxyConnectionSettings
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ProxyConnectionSettings.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.url != null && message.hasOwnProperty("url"))
                    if (!$util.isString(message.url))
                        return "url: string expected";
                if (message.connectHeaders != null && message.hasOwnProperty("connectHeaders")) {
                    var error = $root.opamp.proto.Headers.verify(message.connectHeaders);
                    if (error)
                        return "connectHeaders." + error;
                }
                return null;
            };

            /**
             * Creates a ProxyConnectionSettings message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.ProxyConnectionSettings
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.ProxyConnectionSettings} ProxyConnectionSettings
             */
            ProxyConnectionSettings.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.ProxyConnectionSettings)
                    return object;
                var message = new $root.opamp.proto.ProxyConnectionSettings();
                if (object.url != null)
                    message.url = String(object.url);
                if (object.connectHeaders != null) {
                    if (typeof object.connectHeaders !== "object")
                        throw TypeError(".opamp.proto.ProxyConnectionSettings.connectHeaders: object expected");
                    message.connectHeaders = $root.opamp.proto.Headers.fromObject(object.connectHeaders);
                }
                return message;
            };

            /**
             * Creates a plain object from a ProxyConnectionSettings message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.ProxyConnectionSettings
             * @static
             * @param {opamp.proto.ProxyConnectionSettings} message ProxyConnectionSettings
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ProxyConnectionSettings.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.url = "";
                    object.connectHeaders = null;
                }
                if (message.url != null && message.hasOwnProperty("url"))
                    object.url = message.url;
                if (message.connectHeaders != null && message.hasOwnProperty("connectHeaders"))
                    object.connectHeaders = $root.opamp.proto.Headers.toObject(message.connectHeaders, options);
                return object;
            };

            /**
             * Converts this ProxyConnectionSettings to JSON.
             * @function toJSON
             * @memberof opamp.proto.ProxyConnectionSettings
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ProxyConnectionSettings.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ProxyConnectionSettings
             * @function getTypeUrl
             * @memberof opamp.proto.ProxyConnectionSettings
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ProxyConnectionSettings.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.ProxyConnectionSettings";
            };

            return ProxyConnectionSettings;
        })();

        proto.Headers = (function() {

            /**
             * Properties of a Headers.
             * @memberof opamp.proto
             * @interface IHeaders
             * @property {Array.<opamp.proto.IHeader>|null} [headers] Headers headers
             */

            /**
             * Constructs a new Headers.
             * @memberof opamp.proto
             * @classdesc Represents a Headers.
             * @implements IHeaders
             * @constructor
             * @param {opamp.proto.IHeaders=} [properties] Properties to set
             */
            function Headers(properties) {
                this.headers = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Headers headers.
             * @member {Array.<opamp.proto.IHeader>} headers
             * @memberof opamp.proto.Headers
             * @instance
             */
            Headers.prototype.headers = $util.emptyArray;

            /**
             * Creates a new Headers instance using the specified properties.
             * @function create
             * @memberof opamp.proto.Headers
             * @static
             * @param {opamp.proto.IHeaders=} [properties] Properties to set
             * @returns {opamp.proto.Headers} Headers instance
             */
            Headers.create = function create(properties) {
                return new Headers(properties);
            };

            /**
             * Encodes the specified Headers message. Does not implicitly {@link opamp.proto.Headers.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.Headers
             * @static
             * @param {opamp.proto.IHeaders} message Headers message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Headers.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.headers != null && message.headers.length)
                    for (var i = 0; i < message.headers.length; ++i)
                        $root.opamp.proto.Header.encode(message.headers[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Headers message, length delimited. Does not implicitly {@link opamp.proto.Headers.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.Headers
             * @static
             * @param {opamp.proto.IHeaders} message Headers message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Headers.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Headers message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.Headers
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.Headers} Headers
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Headers.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.Headers();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.headers && message.headers.length))
                                message.headers = [];
                            message.headers.push($root.opamp.proto.Header.decode(reader, reader.uint32()));
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Headers message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.Headers
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.Headers} Headers
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Headers.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Headers message.
             * @function verify
             * @memberof opamp.proto.Headers
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Headers.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.headers != null && message.hasOwnProperty("headers")) {
                    if (!Array.isArray(message.headers))
                        return "headers: array expected";
                    for (var i = 0; i < message.headers.length; ++i) {
                        var error = $root.opamp.proto.Header.verify(message.headers[i]);
                        if (error)
                            return "headers." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a Headers message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.Headers
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.Headers} Headers
             */
            Headers.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.Headers)
                    return object;
                var message = new $root.opamp.proto.Headers();
                if (object.headers) {
                    if (!Array.isArray(object.headers))
                        throw TypeError(".opamp.proto.Headers.headers: array expected");
                    message.headers = [];
                    for (var i = 0; i < object.headers.length; ++i) {
                        if (typeof object.headers[i] !== "object")
                            throw TypeError(".opamp.proto.Headers.headers: object expected");
                        message.headers[i] = $root.opamp.proto.Header.fromObject(object.headers[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a Headers message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.Headers
             * @static
             * @param {opamp.proto.Headers} message Headers
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Headers.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.headers = [];
                if (message.headers && message.headers.length) {
                    object.headers = [];
                    for (var j = 0; j < message.headers.length; ++j)
                        object.headers[j] = $root.opamp.proto.Header.toObject(message.headers[j], options);
                }
                return object;
            };

            /**
             * Converts this Headers to JSON.
             * @function toJSON
             * @memberof opamp.proto.Headers
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Headers.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Headers
             * @function getTypeUrl
             * @memberof opamp.proto.Headers
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Headers.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.Headers";
            };

            return Headers;
        })();

        proto.Header = (function() {

            /**
             * Properties of a Header.
             * @memberof opamp.proto
             * @interface IHeader
             * @property {string|null} [key] Header key
             * @property {string|null} [value] Header value
             */

            /**
             * Constructs a new Header.
             * @memberof opamp.proto
             * @classdesc Represents a Header.
             * @implements IHeader
             * @constructor
             * @param {opamp.proto.IHeader=} [properties] Properties to set
             */
            function Header(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Header key.
             * @member {string} key
             * @memberof opamp.proto.Header
             * @instance
             */
            Header.prototype.key = "";

            /**
             * Header value.
             * @member {string} value
             * @memberof opamp.proto.Header
             * @instance
             */
            Header.prototype.value = "";

            /**
             * Creates a new Header instance using the specified properties.
             * @function create
             * @memberof opamp.proto.Header
             * @static
             * @param {opamp.proto.IHeader=} [properties] Properties to set
             * @returns {opamp.proto.Header} Header instance
             */
            Header.create = function create(properties) {
                return new Header(properties);
            };

            /**
             * Encodes the specified Header message. Does not implicitly {@link opamp.proto.Header.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.Header
             * @static
             * @param {opamp.proto.IHeader} message Header message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Header.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.key != null && Object.hasOwnProperty.call(message, "key"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.key);
                if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.value);
                return writer;
            };

            /**
             * Encodes the specified Header message, length delimited. Does not implicitly {@link opamp.proto.Header.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.Header
             * @static
             * @param {opamp.proto.IHeader} message Header message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Header.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Header message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.Header
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.Header} Header
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Header.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.Header();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.key = reader.string();
                            break;
                        }
                    case 2: {
                            message.value = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Header message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.Header
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.Header} Header
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Header.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Header message.
             * @function verify
             * @memberof opamp.proto.Header
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Header.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.key != null && message.hasOwnProperty("key"))
                    if (!$util.isString(message.key))
                        return "key: string expected";
                if (message.value != null && message.hasOwnProperty("value"))
                    if (!$util.isString(message.value))
                        return "value: string expected";
                return null;
            };

            /**
             * Creates a Header message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.Header
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.Header} Header
             */
            Header.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.Header)
                    return object;
                var message = new $root.opamp.proto.Header();
                if (object.key != null)
                    message.key = String(object.key);
                if (object.value != null)
                    message.value = String(object.value);
                return message;
            };

            /**
             * Creates a plain object from a Header message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.Header
             * @static
             * @param {opamp.proto.Header} message Header
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Header.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.key = "";
                    object.value = "";
                }
                if (message.key != null && message.hasOwnProperty("key"))
                    object.key = message.key;
                if (message.value != null && message.hasOwnProperty("value"))
                    object.value = message.value;
                return object;
            };

            /**
             * Converts this Header to JSON.
             * @function toJSON
             * @memberof opamp.proto.Header
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Header.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Header
             * @function getTypeUrl
             * @memberof opamp.proto.Header
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Header.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.Header";
            };

            return Header;
        })();

        proto.TLSCertificate = (function() {

            /**
             * Properties of a TLSCertificate.
             * @memberof opamp.proto
             * @interface ITLSCertificate
             * @property {Uint8Array|null} [cert] TLSCertificate cert
             * @property {Uint8Array|null} [privateKey] TLSCertificate privateKey
             * @property {Uint8Array|null} [caCert] TLSCertificate caCert
             */

            /**
             * Constructs a new TLSCertificate.
             * @memberof opamp.proto
             * @classdesc Represents a TLSCertificate.
             * @implements ITLSCertificate
             * @constructor
             * @param {opamp.proto.ITLSCertificate=} [properties] Properties to set
             */
            function TLSCertificate(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * TLSCertificate cert.
             * @member {Uint8Array} cert
             * @memberof opamp.proto.TLSCertificate
             * @instance
             */
            TLSCertificate.prototype.cert = $util.newBuffer([]);

            /**
             * TLSCertificate privateKey.
             * @member {Uint8Array} privateKey
             * @memberof opamp.proto.TLSCertificate
             * @instance
             */
            TLSCertificate.prototype.privateKey = $util.newBuffer([]);

            /**
             * TLSCertificate caCert.
             * @member {Uint8Array} caCert
             * @memberof opamp.proto.TLSCertificate
             * @instance
             */
            TLSCertificate.prototype.caCert = $util.newBuffer([]);

            /**
             * Creates a new TLSCertificate instance using the specified properties.
             * @function create
             * @memberof opamp.proto.TLSCertificate
             * @static
             * @param {opamp.proto.ITLSCertificate=} [properties] Properties to set
             * @returns {opamp.proto.TLSCertificate} TLSCertificate instance
             */
            TLSCertificate.create = function create(properties) {
                return new TLSCertificate(properties);
            };

            /**
             * Encodes the specified TLSCertificate message. Does not implicitly {@link opamp.proto.TLSCertificate.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.TLSCertificate
             * @static
             * @param {opamp.proto.ITLSCertificate} message TLSCertificate message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TLSCertificate.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.cert != null && Object.hasOwnProperty.call(message, "cert"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.cert);
                if (message.privateKey != null && Object.hasOwnProperty.call(message, "privateKey"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.privateKey);
                if (message.caCert != null && Object.hasOwnProperty.call(message, "caCert"))
                    writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.caCert);
                return writer;
            };

            /**
             * Encodes the specified TLSCertificate message, length delimited. Does not implicitly {@link opamp.proto.TLSCertificate.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.TLSCertificate
             * @static
             * @param {opamp.proto.ITLSCertificate} message TLSCertificate message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TLSCertificate.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a TLSCertificate message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.TLSCertificate
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.TLSCertificate} TLSCertificate
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TLSCertificate.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.TLSCertificate();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.cert = reader.bytes();
                            break;
                        }
                    case 2: {
                            message.privateKey = reader.bytes();
                            break;
                        }
                    case 3: {
                            message.caCert = reader.bytes();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a TLSCertificate message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.TLSCertificate
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.TLSCertificate} TLSCertificate
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TLSCertificate.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a TLSCertificate message.
             * @function verify
             * @memberof opamp.proto.TLSCertificate
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            TLSCertificate.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.cert != null && message.hasOwnProperty("cert"))
                    if (!(message.cert && typeof message.cert.length === "number" || $util.isString(message.cert)))
                        return "cert: buffer expected";
                if (message.privateKey != null && message.hasOwnProperty("privateKey"))
                    if (!(message.privateKey && typeof message.privateKey.length === "number" || $util.isString(message.privateKey)))
                        return "privateKey: buffer expected";
                if (message.caCert != null && message.hasOwnProperty("caCert"))
                    if (!(message.caCert && typeof message.caCert.length === "number" || $util.isString(message.caCert)))
                        return "caCert: buffer expected";
                return null;
            };

            /**
             * Creates a TLSCertificate message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.TLSCertificate
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.TLSCertificate} TLSCertificate
             */
            TLSCertificate.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.TLSCertificate)
                    return object;
                var message = new $root.opamp.proto.TLSCertificate();
                if (object.cert != null)
                    if (typeof object.cert === "string")
                        $util.base64.decode(object.cert, message.cert = $util.newBuffer($util.base64.length(object.cert)), 0);
                    else if (object.cert.length >= 0)
                        message.cert = object.cert;
                if (object.privateKey != null)
                    if (typeof object.privateKey === "string")
                        $util.base64.decode(object.privateKey, message.privateKey = $util.newBuffer($util.base64.length(object.privateKey)), 0);
                    else if (object.privateKey.length >= 0)
                        message.privateKey = object.privateKey;
                if (object.caCert != null)
                    if (typeof object.caCert === "string")
                        $util.base64.decode(object.caCert, message.caCert = $util.newBuffer($util.base64.length(object.caCert)), 0);
                    else if (object.caCert.length >= 0)
                        message.caCert = object.caCert;
                return message;
            };

            /**
             * Creates a plain object from a TLSCertificate message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.TLSCertificate
             * @static
             * @param {opamp.proto.TLSCertificate} message TLSCertificate
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            TLSCertificate.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    if (options.bytes === String)
                        object.cert = "";
                    else {
                        object.cert = [];
                        if (options.bytes !== Array)
                            object.cert = $util.newBuffer(object.cert);
                    }
                    if (options.bytes === String)
                        object.privateKey = "";
                    else {
                        object.privateKey = [];
                        if (options.bytes !== Array)
                            object.privateKey = $util.newBuffer(object.privateKey);
                    }
                    if (options.bytes === String)
                        object.caCert = "";
                    else {
                        object.caCert = [];
                        if (options.bytes !== Array)
                            object.caCert = $util.newBuffer(object.caCert);
                    }
                }
                if (message.cert != null && message.hasOwnProperty("cert"))
                    object.cert = options.bytes === String ? $util.base64.encode(message.cert, 0, message.cert.length) : options.bytes === Array ? Array.prototype.slice.call(message.cert) : message.cert;
                if (message.privateKey != null && message.hasOwnProperty("privateKey"))
                    object.privateKey = options.bytes === String ? $util.base64.encode(message.privateKey, 0, message.privateKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.privateKey) : message.privateKey;
                if (message.caCert != null && message.hasOwnProperty("caCert"))
                    object.caCert = options.bytes === String ? $util.base64.encode(message.caCert, 0, message.caCert.length) : options.bytes === Array ? Array.prototype.slice.call(message.caCert) : message.caCert;
                return object;
            };

            /**
             * Converts this TLSCertificate to JSON.
             * @function toJSON
             * @memberof opamp.proto.TLSCertificate
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            TLSCertificate.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for TLSCertificate
             * @function getTypeUrl
             * @memberof opamp.proto.TLSCertificate
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            TLSCertificate.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.TLSCertificate";
            };

            return TLSCertificate;
        })();

        proto.ConnectionSettingsOffers = (function() {

            /**
             * Properties of a ConnectionSettingsOffers.
             * @memberof opamp.proto
             * @interface IConnectionSettingsOffers
             * @property {Uint8Array|null} [hash] ConnectionSettingsOffers hash
             * @property {opamp.proto.IOpAMPConnectionSettings|null} [opamp] ConnectionSettingsOffers opamp
             * @property {opamp.proto.ITelemetryConnectionSettings|null} [ownMetrics] ConnectionSettingsOffers ownMetrics
             * @property {opamp.proto.ITelemetryConnectionSettings|null} [ownTraces] ConnectionSettingsOffers ownTraces
             * @property {opamp.proto.ITelemetryConnectionSettings|null} [ownLogs] ConnectionSettingsOffers ownLogs
             * @property {Object.<string,opamp.proto.IOtherConnectionSettings>|null} [otherConnections] ConnectionSettingsOffers otherConnections
             */

            /**
             * Constructs a new ConnectionSettingsOffers.
             * @memberof opamp.proto
             * @classdesc Represents a ConnectionSettingsOffers.
             * @implements IConnectionSettingsOffers
             * @constructor
             * @param {opamp.proto.IConnectionSettingsOffers=} [properties] Properties to set
             */
            function ConnectionSettingsOffers(properties) {
                this.otherConnections = {};
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ConnectionSettingsOffers hash.
             * @member {Uint8Array} hash
             * @memberof opamp.proto.ConnectionSettingsOffers
             * @instance
             */
            ConnectionSettingsOffers.prototype.hash = $util.newBuffer([]);

            /**
             * ConnectionSettingsOffers opamp.
             * @member {opamp.proto.IOpAMPConnectionSettings|null|undefined} opamp
             * @memberof opamp.proto.ConnectionSettingsOffers
             * @instance
             */
            ConnectionSettingsOffers.prototype.opamp = null;

            /**
             * ConnectionSettingsOffers ownMetrics.
             * @member {opamp.proto.ITelemetryConnectionSettings|null|undefined} ownMetrics
             * @memberof opamp.proto.ConnectionSettingsOffers
             * @instance
             */
            ConnectionSettingsOffers.prototype.ownMetrics = null;

            /**
             * ConnectionSettingsOffers ownTraces.
             * @member {opamp.proto.ITelemetryConnectionSettings|null|undefined} ownTraces
             * @memberof opamp.proto.ConnectionSettingsOffers
             * @instance
             */
            ConnectionSettingsOffers.prototype.ownTraces = null;

            /**
             * ConnectionSettingsOffers ownLogs.
             * @member {opamp.proto.ITelemetryConnectionSettings|null|undefined} ownLogs
             * @memberof opamp.proto.ConnectionSettingsOffers
             * @instance
             */
            ConnectionSettingsOffers.prototype.ownLogs = null;

            /**
             * ConnectionSettingsOffers otherConnections.
             * @member {Object.<string,opamp.proto.IOtherConnectionSettings>} otherConnections
             * @memberof opamp.proto.ConnectionSettingsOffers
             * @instance
             */
            ConnectionSettingsOffers.prototype.otherConnections = $util.emptyObject;

            /**
             * Creates a new ConnectionSettingsOffers instance using the specified properties.
             * @function create
             * @memberof opamp.proto.ConnectionSettingsOffers
             * @static
             * @param {opamp.proto.IConnectionSettingsOffers=} [properties] Properties to set
             * @returns {opamp.proto.ConnectionSettingsOffers} ConnectionSettingsOffers instance
             */
            ConnectionSettingsOffers.create = function create(properties) {
                return new ConnectionSettingsOffers(properties);
            };

            /**
             * Encodes the specified ConnectionSettingsOffers message. Does not implicitly {@link opamp.proto.ConnectionSettingsOffers.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.ConnectionSettingsOffers
             * @static
             * @param {opamp.proto.IConnectionSettingsOffers} message ConnectionSettingsOffers message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ConnectionSettingsOffers.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.hash != null && Object.hasOwnProperty.call(message, "hash"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.hash);
                if (message.opamp != null && Object.hasOwnProperty.call(message, "opamp"))
                    $root.opamp.proto.OpAMPConnectionSettings.encode(message.opamp, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.ownMetrics != null && Object.hasOwnProperty.call(message, "ownMetrics"))
                    $root.opamp.proto.TelemetryConnectionSettings.encode(message.ownMetrics, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.ownTraces != null && Object.hasOwnProperty.call(message, "ownTraces"))
                    $root.opamp.proto.TelemetryConnectionSettings.encode(message.ownTraces, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                if (message.ownLogs != null && Object.hasOwnProperty.call(message, "ownLogs"))
                    $root.opamp.proto.TelemetryConnectionSettings.encode(message.ownLogs, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                if (message.otherConnections != null && Object.hasOwnProperty.call(message, "otherConnections"))
                    for (var keys = Object.keys(message.otherConnections), i = 0; i < keys.length; ++i) {
                        writer.uint32(/* id 6, wireType 2 =*/50).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                        $root.opamp.proto.OtherConnectionSettings.encode(message.otherConnections[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                    }
                return writer;
            };

            /**
             * Encodes the specified ConnectionSettingsOffers message, length delimited. Does not implicitly {@link opamp.proto.ConnectionSettingsOffers.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.ConnectionSettingsOffers
             * @static
             * @param {opamp.proto.IConnectionSettingsOffers} message ConnectionSettingsOffers message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ConnectionSettingsOffers.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ConnectionSettingsOffers message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.ConnectionSettingsOffers
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.ConnectionSettingsOffers} ConnectionSettingsOffers
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ConnectionSettingsOffers.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.ConnectionSettingsOffers(), key, value;
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.hash = reader.bytes();
                            break;
                        }
                    case 2: {
                            message.opamp = $root.opamp.proto.OpAMPConnectionSettings.decode(reader, reader.uint32());
                            break;
                        }
                    case 3: {
                            message.ownMetrics = $root.opamp.proto.TelemetryConnectionSettings.decode(reader, reader.uint32());
                            break;
                        }
                    case 4: {
                            message.ownTraces = $root.opamp.proto.TelemetryConnectionSettings.decode(reader, reader.uint32());
                            break;
                        }
                    case 5: {
                            message.ownLogs = $root.opamp.proto.TelemetryConnectionSettings.decode(reader, reader.uint32());
                            break;
                        }
                    case 6: {
                            if (message.otherConnections === $util.emptyObject)
                                message.otherConnections = {};
                            var end2 = reader.uint32() + reader.pos;
                            key = "";
                            value = null;
                            while (reader.pos < end2) {
                                var tag2 = reader.uint32();
                                switch (tag2 >>> 3) {
                                case 1:
                                    key = reader.string();
                                    break;
                                case 2:
                                    value = $root.opamp.proto.OtherConnectionSettings.decode(reader, reader.uint32());
                                    break;
                                default:
                                    reader.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            message.otherConnections[key] = value;
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ConnectionSettingsOffers message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.ConnectionSettingsOffers
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.ConnectionSettingsOffers} ConnectionSettingsOffers
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ConnectionSettingsOffers.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ConnectionSettingsOffers message.
             * @function verify
             * @memberof opamp.proto.ConnectionSettingsOffers
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ConnectionSettingsOffers.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.hash != null && message.hasOwnProperty("hash"))
                    if (!(message.hash && typeof message.hash.length === "number" || $util.isString(message.hash)))
                        return "hash: buffer expected";
                if (message.opamp != null && message.hasOwnProperty("opamp")) {
                    var error = $root.opamp.proto.OpAMPConnectionSettings.verify(message.opamp);
                    if (error)
                        return "opamp." + error;
                }
                if (message.ownMetrics != null && message.hasOwnProperty("ownMetrics")) {
                    var error = $root.opamp.proto.TelemetryConnectionSettings.verify(message.ownMetrics);
                    if (error)
                        return "ownMetrics." + error;
                }
                if (message.ownTraces != null && message.hasOwnProperty("ownTraces")) {
                    var error = $root.opamp.proto.TelemetryConnectionSettings.verify(message.ownTraces);
                    if (error)
                        return "ownTraces." + error;
                }
                if (message.ownLogs != null && message.hasOwnProperty("ownLogs")) {
                    var error = $root.opamp.proto.TelemetryConnectionSettings.verify(message.ownLogs);
                    if (error)
                        return "ownLogs." + error;
                }
                if (message.otherConnections != null && message.hasOwnProperty("otherConnections")) {
                    if (!$util.isObject(message.otherConnections))
                        return "otherConnections: object expected";
                    var key = Object.keys(message.otherConnections);
                    for (var i = 0; i < key.length; ++i) {
                        var error = $root.opamp.proto.OtherConnectionSettings.verify(message.otherConnections[key[i]]);
                        if (error)
                            return "otherConnections." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a ConnectionSettingsOffers message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.ConnectionSettingsOffers
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.ConnectionSettingsOffers} ConnectionSettingsOffers
             */
            ConnectionSettingsOffers.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.ConnectionSettingsOffers)
                    return object;
                var message = new $root.opamp.proto.ConnectionSettingsOffers();
                if (object.hash != null)
                    if (typeof object.hash === "string")
                        $util.base64.decode(object.hash, message.hash = $util.newBuffer($util.base64.length(object.hash)), 0);
                    else if (object.hash.length >= 0)
                        message.hash = object.hash;
                if (object.opamp != null) {
                    if (typeof object.opamp !== "object")
                        throw TypeError(".opamp.proto.ConnectionSettingsOffers.opamp: object expected");
                    message.opamp = $root.opamp.proto.OpAMPConnectionSettings.fromObject(object.opamp);
                }
                if (object.ownMetrics != null) {
                    if (typeof object.ownMetrics !== "object")
                        throw TypeError(".opamp.proto.ConnectionSettingsOffers.ownMetrics: object expected");
                    message.ownMetrics = $root.opamp.proto.TelemetryConnectionSettings.fromObject(object.ownMetrics);
                }
                if (object.ownTraces != null) {
                    if (typeof object.ownTraces !== "object")
                        throw TypeError(".opamp.proto.ConnectionSettingsOffers.ownTraces: object expected");
                    message.ownTraces = $root.opamp.proto.TelemetryConnectionSettings.fromObject(object.ownTraces);
                }
                if (object.ownLogs != null) {
                    if (typeof object.ownLogs !== "object")
                        throw TypeError(".opamp.proto.ConnectionSettingsOffers.ownLogs: object expected");
                    message.ownLogs = $root.opamp.proto.TelemetryConnectionSettings.fromObject(object.ownLogs);
                }
                if (object.otherConnections) {
                    if (typeof object.otherConnections !== "object")
                        throw TypeError(".opamp.proto.ConnectionSettingsOffers.otherConnections: object expected");
                    message.otherConnections = {};
                    for (var keys = Object.keys(object.otherConnections), i = 0; i < keys.length; ++i) {
                        if (typeof object.otherConnections[keys[i]] !== "object")
                            throw TypeError(".opamp.proto.ConnectionSettingsOffers.otherConnections: object expected");
                        message.otherConnections[keys[i]] = $root.opamp.proto.OtherConnectionSettings.fromObject(object.otherConnections[keys[i]]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a ConnectionSettingsOffers message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.ConnectionSettingsOffers
             * @static
             * @param {opamp.proto.ConnectionSettingsOffers} message ConnectionSettingsOffers
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ConnectionSettingsOffers.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.objects || options.defaults)
                    object.otherConnections = {};
                if (options.defaults) {
                    if (options.bytes === String)
                        object.hash = "";
                    else {
                        object.hash = [];
                        if (options.bytes !== Array)
                            object.hash = $util.newBuffer(object.hash);
                    }
                    object.opamp = null;
                    object.ownMetrics = null;
                    object.ownTraces = null;
                    object.ownLogs = null;
                }
                if (message.hash != null && message.hasOwnProperty("hash"))
                    object.hash = options.bytes === String ? $util.base64.encode(message.hash, 0, message.hash.length) : options.bytes === Array ? Array.prototype.slice.call(message.hash) : message.hash;
                if (message.opamp != null && message.hasOwnProperty("opamp"))
                    object.opamp = $root.opamp.proto.OpAMPConnectionSettings.toObject(message.opamp, options);
                if (message.ownMetrics != null && message.hasOwnProperty("ownMetrics"))
                    object.ownMetrics = $root.opamp.proto.TelemetryConnectionSettings.toObject(message.ownMetrics, options);
                if (message.ownTraces != null && message.hasOwnProperty("ownTraces"))
                    object.ownTraces = $root.opamp.proto.TelemetryConnectionSettings.toObject(message.ownTraces, options);
                if (message.ownLogs != null && message.hasOwnProperty("ownLogs"))
                    object.ownLogs = $root.opamp.proto.TelemetryConnectionSettings.toObject(message.ownLogs, options);
                var keys2;
                if (message.otherConnections && (keys2 = Object.keys(message.otherConnections)).length) {
                    object.otherConnections = {};
                    for (var j = 0; j < keys2.length; ++j)
                        object.otherConnections[keys2[j]] = $root.opamp.proto.OtherConnectionSettings.toObject(message.otherConnections[keys2[j]], options);
                }
                return object;
            };

            /**
             * Converts this ConnectionSettingsOffers to JSON.
             * @function toJSON
             * @memberof opamp.proto.ConnectionSettingsOffers
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ConnectionSettingsOffers.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ConnectionSettingsOffers
             * @function getTypeUrl
             * @memberof opamp.proto.ConnectionSettingsOffers
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ConnectionSettingsOffers.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.ConnectionSettingsOffers";
            };

            return ConnectionSettingsOffers;
        })();

        proto.PackagesAvailable = (function() {

            /**
             * Properties of a PackagesAvailable.
             * @memberof opamp.proto
             * @interface IPackagesAvailable
             * @property {Object.<string,opamp.proto.IPackageAvailable>|null} [packages] PackagesAvailable packages
             * @property {Uint8Array|null} [allPackagesHash] PackagesAvailable allPackagesHash
             */

            /**
             * Constructs a new PackagesAvailable.
             * @memberof opamp.proto
             * @classdesc Represents a PackagesAvailable.
             * @implements IPackagesAvailable
             * @constructor
             * @param {opamp.proto.IPackagesAvailable=} [properties] Properties to set
             */
            function PackagesAvailable(properties) {
                this.packages = {};
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * PackagesAvailable packages.
             * @member {Object.<string,opamp.proto.IPackageAvailable>} packages
             * @memberof opamp.proto.PackagesAvailable
             * @instance
             */
            PackagesAvailable.prototype.packages = $util.emptyObject;

            /**
             * PackagesAvailable allPackagesHash.
             * @member {Uint8Array} allPackagesHash
             * @memberof opamp.proto.PackagesAvailable
             * @instance
             */
            PackagesAvailable.prototype.allPackagesHash = $util.newBuffer([]);

            /**
             * Creates a new PackagesAvailable instance using the specified properties.
             * @function create
             * @memberof opamp.proto.PackagesAvailable
             * @static
             * @param {opamp.proto.IPackagesAvailable=} [properties] Properties to set
             * @returns {opamp.proto.PackagesAvailable} PackagesAvailable instance
             */
            PackagesAvailable.create = function create(properties) {
                return new PackagesAvailable(properties);
            };

            /**
             * Encodes the specified PackagesAvailable message. Does not implicitly {@link opamp.proto.PackagesAvailable.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.PackagesAvailable
             * @static
             * @param {opamp.proto.IPackagesAvailable} message PackagesAvailable message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PackagesAvailable.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.packages != null && Object.hasOwnProperty.call(message, "packages"))
                    for (var keys = Object.keys(message.packages), i = 0; i < keys.length; ++i) {
                        writer.uint32(/* id 1, wireType 2 =*/10).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                        $root.opamp.proto.PackageAvailable.encode(message.packages[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                    }
                if (message.allPackagesHash != null && Object.hasOwnProperty.call(message, "allPackagesHash"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.allPackagesHash);
                return writer;
            };

            /**
             * Encodes the specified PackagesAvailable message, length delimited. Does not implicitly {@link opamp.proto.PackagesAvailable.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.PackagesAvailable
             * @static
             * @param {opamp.proto.IPackagesAvailable} message PackagesAvailable message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PackagesAvailable.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a PackagesAvailable message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.PackagesAvailable
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.PackagesAvailable} PackagesAvailable
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PackagesAvailable.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.PackagesAvailable(), key, value;
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (message.packages === $util.emptyObject)
                                message.packages = {};
                            var end2 = reader.uint32() + reader.pos;
                            key = "";
                            value = null;
                            while (reader.pos < end2) {
                                var tag2 = reader.uint32();
                                switch (tag2 >>> 3) {
                                case 1:
                                    key = reader.string();
                                    break;
                                case 2:
                                    value = $root.opamp.proto.PackageAvailable.decode(reader, reader.uint32());
                                    break;
                                default:
                                    reader.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            message.packages[key] = value;
                            break;
                        }
                    case 2: {
                            message.allPackagesHash = reader.bytes();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a PackagesAvailable message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.PackagesAvailable
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.PackagesAvailable} PackagesAvailable
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PackagesAvailable.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a PackagesAvailable message.
             * @function verify
             * @memberof opamp.proto.PackagesAvailable
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            PackagesAvailable.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.packages != null && message.hasOwnProperty("packages")) {
                    if (!$util.isObject(message.packages))
                        return "packages: object expected";
                    var key = Object.keys(message.packages);
                    for (var i = 0; i < key.length; ++i) {
                        var error = $root.opamp.proto.PackageAvailable.verify(message.packages[key[i]]);
                        if (error)
                            return "packages." + error;
                    }
                }
                if (message.allPackagesHash != null && message.hasOwnProperty("allPackagesHash"))
                    if (!(message.allPackagesHash && typeof message.allPackagesHash.length === "number" || $util.isString(message.allPackagesHash)))
                        return "allPackagesHash: buffer expected";
                return null;
            };

            /**
             * Creates a PackagesAvailable message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.PackagesAvailable
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.PackagesAvailable} PackagesAvailable
             */
            PackagesAvailable.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.PackagesAvailable)
                    return object;
                var message = new $root.opamp.proto.PackagesAvailable();
                if (object.packages) {
                    if (typeof object.packages !== "object")
                        throw TypeError(".opamp.proto.PackagesAvailable.packages: object expected");
                    message.packages = {};
                    for (var keys = Object.keys(object.packages), i = 0; i < keys.length; ++i) {
                        if (typeof object.packages[keys[i]] !== "object")
                            throw TypeError(".opamp.proto.PackagesAvailable.packages: object expected");
                        message.packages[keys[i]] = $root.opamp.proto.PackageAvailable.fromObject(object.packages[keys[i]]);
                    }
                }
                if (object.allPackagesHash != null)
                    if (typeof object.allPackagesHash === "string")
                        $util.base64.decode(object.allPackagesHash, message.allPackagesHash = $util.newBuffer($util.base64.length(object.allPackagesHash)), 0);
                    else if (object.allPackagesHash.length >= 0)
                        message.allPackagesHash = object.allPackagesHash;
                return message;
            };

            /**
             * Creates a plain object from a PackagesAvailable message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.PackagesAvailable
             * @static
             * @param {opamp.proto.PackagesAvailable} message PackagesAvailable
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            PackagesAvailable.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.objects || options.defaults)
                    object.packages = {};
                if (options.defaults)
                    if (options.bytes === String)
                        object.allPackagesHash = "";
                    else {
                        object.allPackagesHash = [];
                        if (options.bytes !== Array)
                            object.allPackagesHash = $util.newBuffer(object.allPackagesHash);
                    }
                var keys2;
                if (message.packages && (keys2 = Object.keys(message.packages)).length) {
                    object.packages = {};
                    for (var j = 0; j < keys2.length; ++j)
                        object.packages[keys2[j]] = $root.opamp.proto.PackageAvailable.toObject(message.packages[keys2[j]], options);
                }
                if (message.allPackagesHash != null && message.hasOwnProperty("allPackagesHash"))
                    object.allPackagesHash = options.bytes === String ? $util.base64.encode(message.allPackagesHash, 0, message.allPackagesHash.length) : options.bytes === Array ? Array.prototype.slice.call(message.allPackagesHash) : message.allPackagesHash;
                return object;
            };

            /**
             * Converts this PackagesAvailable to JSON.
             * @function toJSON
             * @memberof opamp.proto.PackagesAvailable
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            PackagesAvailable.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for PackagesAvailable
             * @function getTypeUrl
             * @memberof opamp.proto.PackagesAvailable
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            PackagesAvailable.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.PackagesAvailable";
            };

            return PackagesAvailable;
        })();

        proto.PackageAvailable = (function() {

            /**
             * Properties of a PackageAvailable.
             * @memberof opamp.proto
             * @interface IPackageAvailable
             * @property {opamp.proto.PackageType|null} [type] PackageAvailable type
             * @property {string|null} [version] PackageAvailable version
             * @property {opamp.proto.IDownloadableFile|null} [file] PackageAvailable file
             * @property {Uint8Array|null} [hash] PackageAvailable hash
             */

            /**
             * Constructs a new PackageAvailable.
             * @memberof opamp.proto
             * @classdesc Represents a PackageAvailable.
             * @implements IPackageAvailable
             * @constructor
             * @param {opamp.proto.IPackageAvailable=} [properties] Properties to set
             */
            function PackageAvailable(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * PackageAvailable type.
             * @member {opamp.proto.PackageType} type
             * @memberof opamp.proto.PackageAvailable
             * @instance
             */
            PackageAvailable.prototype.type = 0;

            /**
             * PackageAvailable version.
             * @member {string} version
             * @memberof opamp.proto.PackageAvailable
             * @instance
             */
            PackageAvailable.prototype.version = "";

            /**
             * PackageAvailable file.
             * @member {opamp.proto.IDownloadableFile|null|undefined} file
             * @memberof opamp.proto.PackageAvailable
             * @instance
             */
            PackageAvailable.prototype.file = null;

            /**
             * PackageAvailable hash.
             * @member {Uint8Array} hash
             * @memberof opamp.proto.PackageAvailable
             * @instance
             */
            PackageAvailable.prototype.hash = $util.newBuffer([]);

            /**
             * Creates a new PackageAvailable instance using the specified properties.
             * @function create
             * @memberof opamp.proto.PackageAvailable
             * @static
             * @param {opamp.proto.IPackageAvailable=} [properties] Properties to set
             * @returns {opamp.proto.PackageAvailable} PackageAvailable instance
             */
            PackageAvailable.create = function create(properties) {
                return new PackageAvailable(properties);
            };

            /**
             * Encodes the specified PackageAvailable message. Does not implicitly {@link opamp.proto.PackageAvailable.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.PackageAvailable
             * @static
             * @param {opamp.proto.IPackageAvailable} message PackageAvailable message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PackageAvailable.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
                if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.version);
                if (message.file != null && Object.hasOwnProperty.call(message, "file"))
                    $root.opamp.proto.DownloadableFile.encode(message.file, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.hash != null && Object.hasOwnProperty.call(message, "hash"))
                    writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.hash);
                return writer;
            };

            /**
             * Encodes the specified PackageAvailable message, length delimited. Does not implicitly {@link opamp.proto.PackageAvailable.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.PackageAvailable
             * @static
             * @param {opamp.proto.IPackageAvailable} message PackageAvailable message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PackageAvailable.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a PackageAvailable message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.PackageAvailable
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.PackageAvailable} PackageAvailable
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PackageAvailable.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.PackageAvailable();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.type = reader.int32();
                            break;
                        }
                    case 2: {
                            message.version = reader.string();
                            break;
                        }
                    case 3: {
                            message.file = $root.opamp.proto.DownloadableFile.decode(reader, reader.uint32());
                            break;
                        }
                    case 4: {
                            message.hash = reader.bytes();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a PackageAvailable message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.PackageAvailable
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.PackageAvailable} PackageAvailable
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PackageAvailable.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a PackageAvailable message.
             * @function verify
             * @memberof opamp.proto.PackageAvailable
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            PackageAvailable.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.type != null && message.hasOwnProperty("type"))
                    switch (message.type) {
                    default:
                        return "type: enum value expected";
                    case 0:
                    case 1:
                        break;
                    }
                if (message.version != null && message.hasOwnProperty("version"))
                    if (!$util.isString(message.version))
                        return "version: string expected";
                if (message.file != null && message.hasOwnProperty("file")) {
                    var error = $root.opamp.proto.DownloadableFile.verify(message.file);
                    if (error)
                        return "file." + error;
                }
                if (message.hash != null && message.hasOwnProperty("hash"))
                    if (!(message.hash && typeof message.hash.length === "number" || $util.isString(message.hash)))
                        return "hash: buffer expected";
                return null;
            };

            /**
             * Creates a PackageAvailable message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.PackageAvailable
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.PackageAvailable} PackageAvailable
             */
            PackageAvailable.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.PackageAvailable)
                    return object;
                var message = new $root.opamp.proto.PackageAvailable();
                switch (object.type) {
                default:
                    if (typeof object.type === "number") {
                        message.type = object.type;
                        break;
                    }
                    break;
                case "PackageType_TopLevel":
                case 0:
                    message.type = 0;
                    break;
                case "PackageType_Addon":
                case 1:
                    message.type = 1;
                    break;
                }
                if (object.version != null)
                    message.version = String(object.version);
                if (object.file != null) {
                    if (typeof object.file !== "object")
                        throw TypeError(".opamp.proto.PackageAvailable.file: object expected");
                    message.file = $root.opamp.proto.DownloadableFile.fromObject(object.file);
                }
                if (object.hash != null)
                    if (typeof object.hash === "string")
                        $util.base64.decode(object.hash, message.hash = $util.newBuffer($util.base64.length(object.hash)), 0);
                    else if (object.hash.length >= 0)
                        message.hash = object.hash;
                return message;
            };

            /**
             * Creates a plain object from a PackageAvailable message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.PackageAvailable
             * @static
             * @param {opamp.proto.PackageAvailable} message PackageAvailable
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            PackageAvailable.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.type = options.enums === String ? "PackageType_TopLevel" : 0;
                    object.version = "";
                    object.file = null;
                    if (options.bytes === String)
                        object.hash = "";
                    else {
                        object.hash = [];
                        if (options.bytes !== Array)
                            object.hash = $util.newBuffer(object.hash);
                    }
                }
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = options.enums === String ? $root.opamp.proto.PackageType[message.type] === undefined ? message.type : $root.opamp.proto.PackageType[message.type] : message.type;
                if (message.version != null && message.hasOwnProperty("version"))
                    object.version = message.version;
                if (message.file != null && message.hasOwnProperty("file"))
                    object.file = $root.opamp.proto.DownloadableFile.toObject(message.file, options);
                if (message.hash != null && message.hasOwnProperty("hash"))
                    object.hash = options.bytes === String ? $util.base64.encode(message.hash, 0, message.hash.length) : options.bytes === Array ? Array.prototype.slice.call(message.hash) : message.hash;
                return object;
            };

            /**
             * Converts this PackageAvailable to JSON.
             * @function toJSON
             * @memberof opamp.proto.PackageAvailable
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            PackageAvailable.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for PackageAvailable
             * @function getTypeUrl
             * @memberof opamp.proto.PackageAvailable
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            PackageAvailable.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.PackageAvailable";
            };

            return PackageAvailable;
        })();

        /**
         * PackageType enum.
         * @name opamp.proto.PackageType
         * @enum {number}
         * @property {number} PackageType_TopLevel=0 PackageType_TopLevel value
         * @property {number} PackageType_Addon=1 PackageType_Addon value
         */
        proto.PackageType = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "PackageType_TopLevel"] = 0;
            values[valuesById[1] = "PackageType_Addon"] = 1;
            return values;
        })();

        proto.DownloadableFile = (function() {

            /**
             * Properties of a DownloadableFile.
             * @memberof opamp.proto
             * @interface IDownloadableFile
             * @property {string|null} [downloadUrl] DownloadableFile downloadUrl
             * @property {Uint8Array|null} [contentHash] DownloadableFile contentHash
             * @property {Uint8Array|null} [signature] DownloadableFile signature
             * @property {opamp.proto.IHeaders|null} [headers] DownloadableFile headers
             */

            /**
             * Constructs a new DownloadableFile.
             * @memberof opamp.proto
             * @classdesc Represents a DownloadableFile.
             * @implements IDownloadableFile
             * @constructor
             * @param {opamp.proto.IDownloadableFile=} [properties] Properties to set
             */
            function DownloadableFile(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * DownloadableFile downloadUrl.
             * @member {string} downloadUrl
             * @memberof opamp.proto.DownloadableFile
             * @instance
             */
            DownloadableFile.prototype.downloadUrl = "";

            /**
             * DownloadableFile contentHash.
             * @member {Uint8Array} contentHash
             * @memberof opamp.proto.DownloadableFile
             * @instance
             */
            DownloadableFile.prototype.contentHash = $util.newBuffer([]);

            /**
             * DownloadableFile signature.
             * @member {Uint8Array} signature
             * @memberof opamp.proto.DownloadableFile
             * @instance
             */
            DownloadableFile.prototype.signature = $util.newBuffer([]);

            /**
             * DownloadableFile headers.
             * @member {opamp.proto.IHeaders|null|undefined} headers
             * @memberof opamp.proto.DownloadableFile
             * @instance
             */
            DownloadableFile.prototype.headers = null;

            /**
             * Creates a new DownloadableFile instance using the specified properties.
             * @function create
             * @memberof opamp.proto.DownloadableFile
             * @static
             * @param {opamp.proto.IDownloadableFile=} [properties] Properties to set
             * @returns {opamp.proto.DownloadableFile} DownloadableFile instance
             */
            DownloadableFile.create = function create(properties) {
                return new DownloadableFile(properties);
            };

            /**
             * Encodes the specified DownloadableFile message. Does not implicitly {@link opamp.proto.DownloadableFile.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.DownloadableFile
             * @static
             * @param {opamp.proto.IDownloadableFile} message DownloadableFile message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DownloadableFile.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.downloadUrl != null && Object.hasOwnProperty.call(message, "downloadUrl"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.downloadUrl);
                if (message.contentHash != null && Object.hasOwnProperty.call(message, "contentHash"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.contentHash);
                if (message.signature != null && Object.hasOwnProperty.call(message, "signature"))
                    writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.signature);
                if (message.headers != null && Object.hasOwnProperty.call(message, "headers"))
                    $root.opamp.proto.Headers.encode(message.headers, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified DownloadableFile message, length delimited. Does not implicitly {@link opamp.proto.DownloadableFile.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.DownloadableFile
             * @static
             * @param {opamp.proto.IDownloadableFile} message DownloadableFile message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DownloadableFile.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DownloadableFile message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.DownloadableFile
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.DownloadableFile} DownloadableFile
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DownloadableFile.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.DownloadableFile();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.downloadUrl = reader.string();
                            break;
                        }
                    case 2: {
                            message.contentHash = reader.bytes();
                            break;
                        }
                    case 3: {
                            message.signature = reader.bytes();
                            break;
                        }
                    case 4: {
                            message.headers = $root.opamp.proto.Headers.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a DownloadableFile message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.DownloadableFile
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.DownloadableFile} DownloadableFile
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DownloadableFile.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a DownloadableFile message.
             * @function verify
             * @memberof opamp.proto.DownloadableFile
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DownloadableFile.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.downloadUrl != null && message.hasOwnProperty("downloadUrl"))
                    if (!$util.isString(message.downloadUrl))
                        return "downloadUrl: string expected";
                if (message.contentHash != null && message.hasOwnProperty("contentHash"))
                    if (!(message.contentHash && typeof message.contentHash.length === "number" || $util.isString(message.contentHash)))
                        return "contentHash: buffer expected";
                if (message.signature != null && message.hasOwnProperty("signature"))
                    if (!(message.signature && typeof message.signature.length === "number" || $util.isString(message.signature)))
                        return "signature: buffer expected";
                if (message.headers != null && message.hasOwnProperty("headers")) {
                    var error = $root.opamp.proto.Headers.verify(message.headers);
                    if (error)
                        return "headers." + error;
                }
                return null;
            };

            /**
             * Creates a DownloadableFile message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.DownloadableFile
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.DownloadableFile} DownloadableFile
             */
            DownloadableFile.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.DownloadableFile)
                    return object;
                var message = new $root.opamp.proto.DownloadableFile();
                if (object.downloadUrl != null)
                    message.downloadUrl = String(object.downloadUrl);
                if (object.contentHash != null)
                    if (typeof object.contentHash === "string")
                        $util.base64.decode(object.contentHash, message.contentHash = $util.newBuffer($util.base64.length(object.contentHash)), 0);
                    else if (object.contentHash.length >= 0)
                        message.contentHash = object.contentHash;
                if (object.signature != null)
                    if (typeof object.signature === "string")
                        $util.base64.decode(object.signature, message.signature = $util.newBuffer($util.base64.length(object.signature)), 0);
                    else if (object.signature.length >= 0)
                        message.signature = object.signature;
                if (object.headers != null) {
                    if (typeof object.headers !== "object")
                        throw TypeError(".opamp.proto.DownloadableFile.headers: object expected");
                    message.headers = $root.opamp.proto.Headers.fromObject(object.headers);
                }
                return message;
            };

            /**
             * Creates a plain object from a DownloadableFile message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.DownloadableFile
             * @static
             * @param {opamp.proto.DownloadableFile} message DownloadableFile
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DownloadableFile.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.downloadUrl = "";
                    if (options.bytes === String)
                        object.contentHash = "";
                    else {
                        object.contentHash = [];
                        if (options.bytes !== Array)
                            object.contentHash = $util.newBuffer(object.contentHash);
                    }
                    if (options.bytes === String)
                        object.signature = "";
                    else {
                        object.signature = [];
                        if (options.bytes !== Array)
                            object.signature = $util.newBuffer(object.signature);
                    }
                    object.headers = null;
                }
                if (message.downloadUrl != null && message.hasOwnProperty("downloadUrl"))
                    object.downloadUrl = message.downloadUrl;
                if (message.contentHash != null && message.hasOwnProperty("contentHash"))
                    object.contentHash = options.bytes === String ? $util.base64.encode(message.contentHash, 0, message.contentHash.length) : options.bytes === Array ? Array.prototype.slice.call(message.contentHash) : message.contentHash;
                if (message.signature != null && message.hasOwnProperty("signature"))
                    object.signature = options.bytes === String ? $util.base64.encode(message.signature, 0, message.signature.length) : options.bytes === Array ? Array.prototype.slice.call(message.signature) : message.signature;
                if (message.headers != null && message.hasOwnProperty("headers"))
                    object.headers = $root.opamp.proto.Headers.toObject(message.headers, options);
                return object;
            };

            /**
             * Converts this DownloadableFile to JSON.
             * @function toJSON
             * @memberof opamp.proto.DownloadableFile
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DownloadableFile.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for DownloadableFile
             * @function getTypeUrl
             * @memberof opamp.proto.DownloadableFile
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            DownloadableFile.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.DownloadableFile";
            };

            return DownloadableFile;
        })();

        proto.ServerErrorResponse = (function() {

            /**
             * Properties of a ServerErrorResponse.
             * @memberof opamp.proto
             * @interface IServerErrorResponse
             * @property {opamp.proto.ServerErrorResponseType|null} [type] ServerErrorResponse type
             * @property {string|null} [errorMessage] ServerErrorResponse errorMessage
             * @property {opamp.proto.IRetryInfo|null} [retryInfo] ServerErrorResponse retryInfo
             */

            /**
             * Constructs a new ServerErrorResponse.
             * @memberof opamp.proto
             * @classdesc Represents a ServerErrorResponse.
             * @implements IServerErrorResponse
             * @constructor
             * @param {opamp.proto.IServerErrorResponse=} [properties] Properties to set
             */
            function ServerErrorResponse(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ServerErrorResponse type.
             * @member {opamp.proto.ServerErrorResponseType} type
             * @memberof opamp.proto.ServerErrorResponse
             * @instance
             */
            ServerErrorResponse.prototype.type = 0;

            /**
             * ServerErrorResponse errorMessage.
             * @member {string} errorMessage
             * @memberof opamp.proto.ServerErrorResponse
             * @instance
             */
            ServerErrorResponse.prototype.errorMessage = "";

            /**
             * ServerErrorResponse retryInfo.
             * @member {opamp.proto.IRetryInfo|null|undefined} retryInfo
             * @memberof opamp.proto.ServerErrorResponse
             * @instance
             */
            ServerErrorResponse.prototype.retryInfo = null;

            // OneOf field names bound to virtual getters and setters
            var $oneOfFields;

            /**
             * ServerErrorResponse Details.
             * @member {"retryInfo"|undefined} Details
             * @memberof opamp.proto.ServerErrorResponse
             * @instance
             */
            Object.defineProperty(ServerErrorResponse.prototype, "Details", {
                get: $util.oneOfGetter($oneOfFields = ["retryInfo"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new ServerErrorResponse instance using the specified properties.
             * @function create
             * @memberof opamp.proto.ServerErrorResponse
             * @static
             * @param {opamp.proto.IServerErrorResponse=} [properties] Properties to set
             * @returns {opamp.proto.ServerErrorResponse} ServerErrorResponse instance
             */
            ServerErrorResponse.create = function create(properties) {
                return new ServerErrorResponse(properties);
            };

            /**
             * Encodes the specified ServerErrorResponse message. Does not implicitly {@link opamp.proto.ServerErrorResponse.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.ServerErrorResponse
             * @static
             * @param {opamp.proto.IServerErrorResponse} message ServerErrorResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ServerErrorResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
                if (message.errorMessage != null && Object.hasOwnProperty.call(message, "errorMessage"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.errorMessage);
                if (message.retryInfo != null && Object.hasOwnProperty.call(message, "retryInfo"))
                    $root.opamp.proto.RetryInfo.encode(message.retryInfo, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified ServerErrorResponse message, length delimited. Does not implicitly {@link opamp.proto.ServerErrorResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.ServerErrorResponse
             * @static
             * @param {opamp.proto.IServerErrorResponse} message ServerErrorResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ServerErrorResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ServerErrorResponse message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.ServerErrorResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.ServerErrorResponse} ServerErrorResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ServerErrorResponse.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.ServerErrorResponse();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.type = reader.int32();
                            break;
                        }
                    case 2: {
                            message.errorMessage = reader.string();
                            break;
                        }
                    case 3: {
                            message.retryInfo = $root.opamp.proto.RetryInfo.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ServerErrorResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.ServerErrorResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.ServerErrorResponse} ServerErrorResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ServerErrorResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ServerErrorResponse message.
             * @function verify
             * @memberof opamp.proto.ServerErrorResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ServerErrorResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                var properties = {};
                if (message.type != null && message.hasOwnProperty("type"))
                    switch (message.type) {
                    default:
                        return "type: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                        break;
                    }
                if (message.errorMessage != null && message.hasOwnProperty("errorMessage"))
                    if (!$util.isString(message.errorMessage))
                        return "errorMessage: string expected";
                if (message.retryInfo != null && message.hasOwnProperty("retryInfo")) {
                    properties.Details = 1;
                    {
                        var error = $root.opamp.proto.RetryInfo.verify(message.retryInfo);
                        if (error)
                            return "retryInfo." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a ServerErrorResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.ServerErrorResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.ServerErrorResponse} ServerErrorResponse
             */
            ServerErrorResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.ServerErrorResponse)
                    return object;
                var message = new $root.opamp.proto.ServerErrorResponse();
                switch (object.type) {
                default:
                    if (typeof object.type === "number") {
                        message.type = object.type;
                        break;
                    }
                    break;
                case "ServerErrorResponseType_Unknown":
                case 0:
                    message.type = 0;
                    break;
                case "ServerErrorResponseType_BadRequest":
                case 1:
                    message.type = 1;
                    break;
                case "ServerErrorResponseType_Unavailable":
                case 2:
                    message.type = 2;
                    break;
                }
                if (object.errorMessage != null)
                    message.errorMessage = String(object.errorMessage);
                if (object.retryInfo != null) {
                    if (typeof object.retryInfo !== "object")
                        throw TypeError(".opamp.proto.ServerErrorResponse.retryInfo: object expected");
                    message.retryInfo = $root.opamp.proto.RetryInfo.fromObject(object.retryInfo);
                }
                return message;
            };

            /**
             * Creates a plain object from a ServerErrorResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.ServerErrorResponse
             * @static
             * @param {opamp.proto.ServerErrorResponse} message ServerErrorResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ServerErrorResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.type = options.enums === String ? "ServerErrorResponseType_Unknown" : 0;
                    object.errorMessage = "";
                }
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = options.enums === String ? $root.opamp.proto.ServerErrorResponseType[message.type] === undefined ? message.type : $root.opamp.proto.ServerErrorResponseType[message.type] : message.type;
                if (message.errorMessage != null && message.hasOwnProperty("errorMessage"))
                    object.errorMessage = message.errorMessage;
                if (message.retryInfo != null && message.hasOwnProperty("retryInfo")) {
                    object.retryInfo = $root.opamp.proto.RetryInfo.toObject(message.retryInfo, options);
                    if (options.oneofs)
                        object.Details = "retryInfo";
                }
                return object;
            };

            /**
             * Converts this ServerErrorResponse to JSON.
             * @function toJSON
             * @memberof opamp.proto.ServerErrorResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ServerErrorResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ServerErrorResponse
             * @function getTypeUrl
             * @memberof opamp.proto.ServerErrorResponse
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ServerErrorResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.ServerErrorResponse";
            };

            return ServerErrorResponse;
        })();

        /**
         * ServerErrorResponseType enum.
         * @name opamp.proto.ServerErrorResponseType
         * @enum {number}
         * @property {number} ServerErrorResponseType_Unknown=0 ServerErrorResponseType_Unknown value
         * @property {number} ServerErrorResponseType_BadRequest=1 ServerErrorResponseType_BadRequest value
         * @property {number} ServerErrorResponseType_Unavailable=2 ServerErrorResponseType_Unavailable value
         */
        proto.ServerErrorResponseType = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "ServerErrorResponseType_Unknown"] = 0;
            values[valuesById[1] = "ServerErrorResponseType_BadRequest"] = 1;
            values[valuesById[2] = "ServerErrorResponseType_Unavailable"] = 2;
            return values;
        })();

        proto.RetryInfo = (function() {

            /**
             * Properties of a RetryInfo.
             * @memberof opamp.proto
             * @interface IRetryInfo
             * @property {number|Long|null} [retryAfterNanoseconds] RetryInfo retryAfterNanoseconds
             */

            /**
             * Constructs a new RetryInfo.
             * @memberof opamp.proto
             * @classdesc Represents a RetryInfo.
             * @implements IRetryInfo
             * @constructor
             * @param {opamp.proto.IRetryInfo=} [properties] Properties to set
             */
            function RetryInfo(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * RetryInfo retryAfterNanoseconds.
             * @member {number|Long} retryAfterNanoseconds
             * @memberof opamp.proto.RetryInfo
             * @instance
             */
            RetryInfo.prototype.retryAfterNanoseconds = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * Creates a new RetryInfo instance using the specified properties.
             * @function create
             * @memberof opamp.proto.RetryInfo
             * @static
             * @param {opamp.proto.IRetryInfo=} [properties] Properties to set
             * @returns {opamp.proto.RetryInfo} RetryInfo instance
             */
            RetryInfo.create = function create(properties) {
                return new RetryInfo(properties);
            };

            /**
             * Encodes the specified RetryInfo message. Does not implicitly {@link opamp.proto.RetryInfo.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.RetryInfo
             * @static
             * @param {opamp.proto.IRetryInfo} message RetryInfo message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            RetryInfo.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.retryAfterNanoseconds != null && Object.hasOwnProperty.call(message, "retryAfterNanoseconds"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.retryAfterNanoseconds);
                return writer;
            };

            /**
             * Encodes the specified RetryInfo message, length delimited. Does not implicitly {@link opamp.proto.RetryInfo.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.RetryInfo
             * @static
             * @param {opamp.proto.IRetryInfo} message RetryInfo message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            RetryInfo.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a RetryInfo message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.RetryInfo
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.RetryInfo} RetryInfo
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            RetryInfo.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.RetryInfo();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.retryAfterNanoseconds = reader.uint64();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a RetryInfo message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.RetryInfo
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.RetryInfo} RetryInfo
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            RetryInfo.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a RetryInfo message.
             * @function verify
             * @memberof opamp.proto.RetryInfo
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            RetryInfo.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.retryAfterNanoseconds != null && message.hasOwnProperty("retryAfterNanoseconds"))
                    if (!$util.isInteger(message.retryAfterNanoseconds) && !(message.retryAfterNanoseconds && $util.isInteger(message.retryAfterNanoseconds.low) && $util.isInteger(message.retryAfterNanoseconds.high)))
                        return "retryAfterNanoseconds: integer|Long expected";
                return null;
            };

            /**
             * Creates a RetryInfo message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.RetryInfo
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.RetryInfo} RetryInfo
             */
            RetryInfo.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.RetryInfo)
                    return object;
                var message = new $root.opamp.proto.RetryInfo();
                if (object.retryAfterNanoseconds != null)
                    if ($util.Long)
                        (message.retryAfterNanoseconds = $util.Long.fromValue(object.retryAfterNanoseconds)).unsigned = true;
                    else if (typeof object.retryAfterNanoseconds === "string")
                        message.retryAfterNanoseconds = parseInt(object.retryAfterNanoseconds, 10);
                    else if (typeof object.retryAfterNanoseconds === "number")
                        message.retryAfterNanoseconds = object.retryAfterNanoseconds;
                    else if (typeof object.retryAfterNanoseconds === "object")
                        message.retryAfterNanoseconds = new $util.LongBits(object.retryAfterNanoseconds.low >>> 0, object.retryAfterNanoseconds.high >>> 0).toNumber(true);
                return message;
            };

            /**
             * Creates a plain object from a RetryInfo message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.RetryInfo
             * @static
             * @param {opamp.proto.RetryInfo} message RetryInfo
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            RetryInfo.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.retryAfterNanoseconds = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.retryAfterNanoseconds = options.longs === String ? "0" : 0;
                if (message.retryAfterNanoseconds != null && message.hasOwnProperty("retryAfterNanoseconds"))
                    if (typeof message.retryAfterNanoseconds === "number")
                        object.retryAfterNanoseconds = options.longs === String ? String(message.retryAfterNanoseconds) : message.retryAfterNanoseconds;
                    else
                        object.retryAfterNanoseconds = options.longs === String ? $util.Long.prototype.toString.call(message.retryAfterNanoseconds) : options.longs === Number ? new $util.LongBits(message.retryAfterNanoseconds.low >>> 0, message.retryAfterNanoseconds.high >>> 0).toNumber(true) : message.retryAfterNanoseconds;
                return object;
            };

            /**
             * Converts this RetryInfo to JSON.
             * @function toJSON
             * @memberof opamp.proto.RetryInfo
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            RetryInfo.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for RetryInfo
             * @function getTypeUrl
             * @memberof opamp.proto.RetryInfo
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            RetryInfo.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.RetryInfo";
            };

            return RetryInfo;
        })();

        proto.ServerToAgentCommand = (function() {

            /**
             * Properties of a ServerToAgentCommand.
             * @memberof opamp.proto
             * @interface IServerToAgentCommand
             * @property {opamp.proto.CommandType|null} [type] ServerToAgentCommand type
             */

            /**
             * Constructs a new ServerToAgentCommand.
             * @memberof opamp.proto
             * @classdesc Represents a ServerToAgentCommand.
             * @implements IServerToAgentCommand
             * @constructor
             * @param {opamp.proto.IServerToAgentCommand=} [properties] Properties to set
             */
            function ServerToAgentCommand(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ServerToAgentCommand type.
             * @member {opamp.proto.CommandType} type
             * @memberof opamp.proto.ServerToAgentCommand
             * @instance
             */
            ServerToAgentCommand.prototype.type = 0;

            /**
             * Creates a new ServerToAgentCommand instance using the specified properties.
             * @function create
             * @memberof opamp.proto.ServerToAgentCommand
             * @static
             * @param {opamp.proto.IServerToAgentCommand=} [properties] Properties to set
             * @returns {opamp.proto.ServerToAgentCommand} ServerToAgentCommand instance
             */
            ServerToAgentCommand.create = function create(properties) {
                return new ServerToAgentCommand(properties);
            };

            /**
             * Encodes the specified ServerToAgentCommand message. Does not implicitly {@link opamp.proto.ServerToAgentCommand.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.ServerToAgentCommand
             * @static
             * @param {opamp.proto.IServerToAgentCommand} message ServerToAgentCommand message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ServerToAgentCommand.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
                return writer;
            };

            /**
             * Encodes the specified ServerToAgentCommand message, length delimited. Does not implicitly {@link opamp.proto.ServerToAgentCommand.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.ServerToAgentCommand
             * @static
             * @param {opamp.proto.IServerToAgentCommand} message ServerToAgentCommand message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ServerToAgentCommand.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ServerToAgentCommand message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.ServerToAgentCommand
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.ServerToAgentCommand} ServerToAgentCommand
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ServerToAgentCommand.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.ServerToAgentCommand();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.type = reader.int32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ServerToAgentCommand message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.ServerToAgentCommand
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.ServerToAgentCommand} ServerToAgentCommand
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ServerToAgentCommand.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ServerToAgentCommand message.
             * @function verify
             * @memberof opamp.proto.ServerToAgentCommand
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ServerToAgentCommand.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.type != null && message.hasOwnProperty("type"))
                    switch (message.type) {
                    default:
                        return "type: enum value expected";
                    case 0:
                        break;
                    }
                return null;
            };

            /**
             * Creates a ServerToAgentCommand message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.ServerToAgentCommand
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.ServerToAgentCommand} ServerToAgentCommand
             */
            ServerToAgentCommand.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.ServerToAgentCommand)
                    return object;
                var message = new $root.opamp.proto.ServerToAgentCommand();
                switch (object.type) {
                default:
                    if (typeof object.type === "number") {
                        message.type = object.type;
                        break;
                    }
                    break;
                case "CommandType_Restart":
                case 0:
                    message.type = 0;
                    break;
                }
                return message;
            };

            /**
             * Creates a plain object from a ServerToAgentCommand message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.ServerToAgentCommand
             * @static
             * @param {opamp.proto.ServerToAgentCommand} message ServerToAgentCommand
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ServerToAgentCommand.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.type = options.enums === String ? "CommandType_Restart" : 0;
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = options.enums === String ? $root.opamp.proto.CommandType[message.type] === undefined ? message.type : $root.opamp.proto.CommandType[message.type] : message.type;
                return object;
            };

            /**
             * Converts this ServerToAgentCommand to JSON.
             * @function toJSON
             * @memberof opamp.proto.ServerToAgentCommand
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ServerToAgentCommand.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ServerToAgentCommand
             * @function getTypeUrl
             * @memberof opamp.proto.ServerToAgentCommand
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ServerToAgentCommand.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.ServerToAgentCommand";
            };

            return ServerToAgentCommand;
        })();

        /**
         * CommandType enum.
         * @name opamp.proto.CommandType
         * @enum {number}
         * @property {number} CommandType_Restart=0 CommandType_Restart value
         */
        proto.CommandType = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "CommandType_Restart"] = 0;
            return values;
        })();

        proto.AgentDescription = (function() {

            /**
             * Properties of an AgentDescription.
             * @memberof opamp.proto
             * @interface IAgentDescription
             * @property {Array.<opamp.proto.IKeyValue>|null} [identifyingAttributes] AgentDescription identifyingAttributes
             * @property {Array.<opamp.proto.IKeyValue>|null} [nonIdentifyingAttributes] AgentDescription nonIdentifyingAttributes
             */

            /**
             * Constructs a new AgentDescription.
             * @memberof opamp.proto
             * @classdesc Represents an AgentDescription.
             * @implements IAgentDescription
             * @constructor
             * @param {opamp.proto.IAgentDescription=} [properties] Properties to set
             */
            function AgentDescription(properties) {
                this.identifyingAttributes = [];
                this.nonIdentifyingAttributes = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * AgentDescription identifyingAttributes.
             * @member {Array.<opamp.proto.IKeyValue>} identifyingAttributes
             * @memberof opamp.proto.AgentDescription
             * @instance
             */
            AgentDescription.prototype.identifyingAttributes = $util.emptyArray;

            /**
             * AgentDescription nonIdentifyingAttributes.
             * @member {Array.<opamp.proto.IKeyValue>} nonIdentifyingAttributes
             * @memberof opamp.proto.AgentDescription
             * @instance
             */
            AgentDescription.prototype.nonIdentifyingAttributes = $util.emptyArray;

            /**
             * Creates a new AgentDescription instance using the specified properties.
             * @function create
             * @memberof opamp.proto.AgentDescription
             * @static
             * @param {opamp.proto.IAgentDescription=} [properties] Properties to set
             * @returns {opamp.proto.AgentDescription} AgentDescription instance
             */
            AgentDescription.create = function create(properties) {
                return new AgentDescription(properties);
            };

            /**
             * Encodes the specified AgentDescription message. Does not implicitly {@link opamp.proto.AgentDescription.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.AgentDescription
             * @static
             * @param {opamp.proto.IAgentDescription} message AgentDescription message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AgentDescription.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.identifyingAttributes != null && message.identifyingAttributes.length)
                    for (var i = 0; i < message.identifyingAttributes.length; ++i)
                        $root.opamp.proto.KeyValue.encode(message.identifyingAttributes[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.nonIdentifyingAttributes != null && message.nonIdentifyingAttributes.length)
                    for (var i = 0; i < message.nonIdentifyingAttributes.length; ++i)
                        $root.opamp.proto.KeyValue.encode(message.nonIdentifyingAttributes[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified AgentDescription message, length delimited. Does not implicitly {@link opamp.proto.AgentDescription.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.AgentDescription
             * @static
             * @param {opamp.proto.IAgentDescription} message AgentDescription message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AgentDescription.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an AgentDescription message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.AgentDescription
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.AgentDescription} AgentDescription
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AgentDescription.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.AgentDescription();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.identifyingAttributes && message.identifyingAttributes.length))
                                message.identifyingAttributes = [];
                            message.identifyingAttributes.push($root.opamp.proto.KeyValue.decode(reader, reader.uint32()));
                            break;
                        }
                    case 2: {
                            if (!(message.nonIdentifyingAttributes && message.nonIdentifyingAttributes.length))
                                message.nonIdentifyingAttributes = [];
                            message.nonIdentifyingAttributes.push($root.opamp.proto.KeyValue.decode(reader, reader.uint32()));
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an AgentDescription message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.AgentDescription
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.AgentDescription} AgentDescription
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AgentDescription.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an AgentDescription message.
             * @function verify
             * @memberof opamp.proto.AgentDescription
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            AgentDescription.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.identifyingAttributes != null && message.hasOwnProperty("identifyingAttributes")) {
                    if (!Array.isArray(message.identifyingAttributes))
                        return "identifyingAttributes: array expected";
                    for (var i = 0; i < message.identifyingAttributes.length; ++i) {
                        var error = $root.opamp.proto.KeyValue.verify(message.identifyingAttributes[i]);
                        if (error)
                            return "identifyingAttributes." + error;
                    }
                }
                if (message.nonIdentifyingAttributes != null && message.hasOwnProperty("nonIdentifyingAttributes")) {
                    if (!Array.isArray(message.nonIdentifyingAttributes))
                        return "nonIdentifyingAttributes: array expected";
                    for (var i = 0; i < message.nonIdentifyingAttributes.length; ++i) {
                        var error = $root.opamp.proto.KeyValue.verify(message.nonIdentifyingAttributes[i]);
                        if (error)
                            return "nonIdentifyingAttributes." + error;
                    }
                }
                return null;
            };

            /**
             * Creates an AgentDescription message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.AgentDescription
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.AgentDescription} AgentDescription
             */
            AgentDescription.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.AgentDescription)
                    return object;
                var message = new $root.opamp.proto.AgentDescription();
                if (object.identifyingAttributes) {
                    if (!Array.isArray(object.identifyingAttributes))
                        throw TypeError(".opamp.proto.AgentDescription.identifyingAttributes: array expected");
                    message.identifyingAttributes = [];
                    for (var i = 0; i < object.identifyingAttributes.length; ++i) {
                        if (typeof object.identifyingAttributes[i] !== "object")
                            throw TypeError(".opamp.proto.AgentDescription.identifyingAttributes: object expected");
                        message.identifyingAttributes[i] = $root.opamp.proto.KeyValue.fromObject(object.identifyingAttributes[i]);
                    }
                }
                if (object.nonIdentifyingAttributes) {
                    if (!Array.isArray(object.nonIdentifyingAttributes))
                        throw TypeError(".opamp.proto.AgentDescription.nonIdentifyingAttributes: array expected");
                    message.nonIdentifyingAttributes = [];
                    for (var i = 0; i < object.nonIdentifyingAttributes.length; ++i) {
                        if (typeof object.nonIdentifyingAttributes[i] !== "object")
                            throw TypeError(".opamp.proto.AgentDescription.nonIdentifyingAttributes: object expected");
                        message.nonIdentifyingAttributes[i] = $root.opamp.proto.KeyValue.fromObject(object.nonIdentifyingAttributes[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from an AgentDescription message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.AgentDescription
             * @static
             * @param {opamp.proto.AgentDescription} message AgentDescription
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            AgentDescription.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults) {
                    object.identifyingAttributes = [];
                    object.nonIdentifyingAttributes = [];
                }
                if (message.identifyingAttributes && message.identifyingAttributes.length) {
                    object.identifyingAttributes = [];
                    for (var j = 0; j < message.identifyingAttributes.length; ++j)
                        object.identifyingAttributes[j] = $root.opamp.proto.KeyValue.toObject(message.identifyingAttributes[j], options);
                }
                if (message.nonIdentifyingAttributes && message.nonIdentifyingAttributes.length) {
                    object.nonIdentifyingAttributes = [];
                    for (var j = 0; j < message.nonIdentifyingAttributes.length; ++j)
                        object.nonIdentifyingAttributes[j] = $root.opamp.proto.KeyValue.toObject(message.nonIdentifyingAttributes[j], options);
                }
                return object;
            };

            /**
             * Converts this AgentDescription to JSON.
             * @function toJSON
             * @memberof opamp.proto.AgentDescription
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            AgentDescription.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for AgentDescription
             * @function getTypeUrl
             * @memberof opamp.proto.AgentDescription
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            AgentDescription.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.AgentDescription";
            };

            return AgentDescription;
        })();

        /**
         * AgentCapabilities enum.
         * @name opamp.proto.AgentCapabilities
         * @enum {number}
         * @property {number} AgentCapabilities_Unspecified=0 AgentCapabilities_Unspecified value
         * @property {number} AgentCapabilities_ReportsStatus=1 AgentCapabilities_ReportsStatus value
         * @property {number} AgentCapabilities_AcceptsRemoteConfig=2 AgentCapabilities_AcceptsRemoteConfig value
         * @property {number} AgentCapabilities_ReportsEffectiveConfig=4 AgentCapabilities_ReportsEffectiveConfig value
         * @property {number} AgentCapabilities_AcceptsPackages=8 AgentCapabilities_AcceptsPackages value
         * @property {number} AgentCapabilities_ReportsPackageStatuses=16 AgentCapabilities_ReportsPackageStatuses value
         * @property {number} AgentCapabilities_ReportsOwnTraces=32 AgentCapabilities_ReportsOwnTraces value
         * @property {number} AgentCapabilities_ReportsOwnMetrics=64 AgentCapabilities_ReportsOwnMetrics value
         * @property {number} AgentCapabilities_ReportsOwnLogs=128 AgentCapabilities_ReportsOwnLogs value
         * @property {number} AgentCapabilities_AcceptsOpAMPConnectionSettings=256 AgentCapabilities_AcceptsOpAMPConnectionSettings value
         * @property {number} AgentCapabilities_AcceptsOtherConnectionSettings=512 AgentCapabilities_AcceptsOtherConnectionSettings value
         * @property {number} AgentCapabilities_AcceptsRestartCommand=1024 AgentCapabilities_AcceptsRestartCommand value
         * @property {number} AgentCapabilities_ReportsHealth=2048 AgentCapabilities_ReportsHealth value
         * @property {number} AgentCapabilities_ReportsRemoteConfig=4096 AgentCapabilities_ReportsRemoteConfig value
         * @property {number} AgentCapabilities_ReportsHeartbeat=8192 AgentCapabilities_ReportsHeartbeat value
         * @property {number} AgentCapabilities_ReportsAvailableComponents=16384 AgentCapabilities_ReportsAvailableComponents value
         * @property {number} AgentCapabilities_ReportsConnectionSettingsStatus=32768 AgentCapabilities_ReportsConnectionSettingsStatus value
         */
        proto.AgentCapabilities = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "AgentCapabilities_Unspecified"] = 0;
            values[valuesById[1] = "AgentCapabilities_ReportsStatus"] = 1;
            values[valuesById[2] = "AgentCapabilities_AcceptsRemoteConfig"] = 2;
            values[valuesById[4] = "AgentCapabilities_ReportsEffectiveConfig"] = 4;
            values[valuesById[8] = "AgentCapabilities_AcceptsPackages"] = 8;
            values[valuesById[16] = "AgentCapabilities_ReportsPackageStatuses"] = 16;
            values[valuesById[32] = "AgentCapabilities_ReportsOwnTraces"] = 32;
            values[valuesById[64] = "AgentCapabilities_ReportsOwnMetrics"] = 64;
            values[valuesById[128] = "AgentCapabilities_ReportsOwnLogs"] = 128;
            values[valuesById[256] = "AgentCapabilities_AcceptsOpAMPConnectionSettings"] = 256;
            values[valuesById[512] = "AgentCapabilities_AcceptsOtherConnectionSettings"] = 512;
            values[valuesById[1024] = "AgentCapabilities_AcceptsRestartCommand"] = 1024;
            values[valuesById[2048] = "AgentCapabilities_ReportsHealth"] = 2048;
            values[valuesById[4096] = "AgentCapabilities_ReportsRemoteConfig"] = 4096;
            values[valuesById[8192] = "AgentCapabilities_ReportsHeartbeat"] = 8192;
            values[valuesById[16384] = "AgentCapabilities_ReportsAvailableComponents"] = 16384;
            values[valuesById[32768] = "AgentCapabilities_ReportsConnectionSettingsStatus"] = 32768;
            return values;
        })();

        proto.ComponentHealth = (function() {

            /**
             * Properties of a ComponentHealth.
             * @memberof opamp.proto
             * @interface IComponentHealth
             * @property {boolean|null} [healthy] ComponentHealth healthy
             * @property {number|Long|null} [startTimeUnixNano] ComponentHealth startTimeUnixNano
             * @property {string|null} [lastError] ComponentHealth lastError
             * @property {string|null} [status] ComponentHealth status
             * @property {number|Long|null} [statusTimeUnixNano] ComponentHealth statusTimeUnixNano
             * @property {Object.<string,opamp.proto.IComponentHealth>|null} [componentHealthMap] ComponentHealth componentHealthMap
             */

            /**
             * Constructs a new ComponentHealth.
             * @memberof opamp.proto
             * @classdesc Represents a ComponentHealth.
             * @implements IComponentHealth
             * @constructor
             * @param {opamp.proto.IComponentHealth=} [properties] Properties to set
             */
            function ComponentHealth(properties) {
                this.componentHealthMap = {};
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ComponentHealth healthy.
             * @member {boolean} healthy
             * @memberof opamp.proto.ComponentHealth
             * @instance
             */
            ComponentHealth.prototype.healthy = false;

            /**
             * ComponentHealth startTimeUnixNano.
             * @member {number|Long} startTimeUnixNano
             * @memberof opamp.proto.ComponentHealth
             * @instance
             */
            ComponentHealth.prototype.startTimeUnixNano = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * ComponentHealth lastError.
             * @member {string} lastError
             * @memberof opamp.proto.ComponentHealth
             * @instance
             */
            ComponentHealth.prototype.lastError = "";

            /**
             * ComponentHealth status.
             * @member {string} status
             * @memberof opamp.proto.ComponentHealth
             * @instance
             */
            ComponentHealth.prototype.status = "";

            /**
             * ComponentHealth statusTimeUnixNano.
             * @member {number|Long} statusTimeUnixNano
             * @memberof opamp.proto.ComponentHealth
             * @instance
             */
            ComponentHealth.prototype.statusTimeUnixNano = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * ComponentHealth componentHealthMap.
             * @member {Object.<string,opamp.proto.IComponentHealth>} componentHealthMap
             * @memberof opamp.proto.ComponentHealth
             * @instance
             */
            ComponentHealth.prototype.componentHealthMap = $util.emptyObject;

            /**
             * Creates a new ComponentHealth instance using the specified properties.
             * @function create
             * @memberof opamp.proto.ComponentHealth
             * @static
             * @param {opamp.proto.IComponentHealth=} [properties] Properties to set
             * @returns {opamp.proto.ComponentHealth} ComponentHealth instance
             */
            ComponentHealth.create = function create(properties) {
                return new ComponentHealth(properties);
            };

            /**
             * Encodes the specified ComponentHealth message. Does not implicitly {@link opamp.proto.ComponentHealth.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.ComponentHealth
             * @static
             * @param {opamp.proto.IComponentHealth} message ComponentHealth message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ComponentHealth.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.healthy != null && Object.hasOwnProperty.call(message, "healthy"))
                    writer.uint32(/* id 1, wireType 0 =*/8).bool(message.healthy);
                if (message.startTimeUnixNano != null && Object.hasOwnProperty.call(message, "startTimeUnixNano"))
                    writer.uint32(/* id 2, wireType 1 =*/17).fixed64(message.startTimeUnixNano);
                if (message.lastError != null && Object.hasOwnProperty.call(message, "lastError"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.lastError);
                if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.status);
                if (message.statusTimeUnixNano != null && Object.hasOwnProperty.call(message, "statusTimeUnixNano"))
                    writer.uint32(/* id 5, wireType 1 =*/41).fixed64(message.statusTimeUnixNano);
                if (message.componentHealthMap != null && Object.hasOwnProperty.call(message, "componentHealthMap"))
                    for (var keys = Object.keys(message.componentHealthMap), i = 0; i < keys.length; ++i) {
                        writer.uint32(/* id 6, wireType 2 =*/50).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                        $root.opamp.proto.ComponentHealth.encode(message.componentHealthMap[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                    }
                return writer;
            };

            /**
             * Encodes the specified ComponentHealth message, length delimited. Does not implicitly {@link opamp.proto.ComponentHealth.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.ComponentHealth
             * @static
             * @param {opamp.proto.IComponentHealth} message ComponentHealth message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ComponentHealth.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ComponentHealth message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.ComponentHealth
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.ComponentHealth} ComponentHealth
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ComponentHealth.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.ComponentHealth(), key, value;
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.healthy = reader.bool();
                            break;
                        }
                    case 2: {
                            message.startTimeUnixNano = reader.fixed64();
                            break;
                        }
                    case 3: {
                            message.lastError = reader.string();
                            break;
                        }
                    case 4: {
                            message.status = reader.string();
                            break;
                        }
                    case 5: {
                            message.statusTimeUnixNano = reader.fixed64();
                            break;
                        }
                    case 6: {
                            if (message.componentHealthMap === $util.emptyObject)
                                message.componentHealthMap = {};
                            var end2 = reader.uint32() + reader.pos;
                            key = "";
                            value = null;
                            while (reader.pos < end2) {
                                var tag2 = reader.uint32();
                                switch (tag2 >>> 3) {
                                case 1:
                                    key = reader.string();
                                    break;
                                case 2:
                                    value = $root.opamp.proto.ComponentHealth.decode(reader, reader.uint32());
                                    break;
                                default:
                                    reader.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            message.componentHealthMap[key] = value;
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ComponentHealth message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.ComponentHealth
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.ComponentHealth} ComponentHealth
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ComponentHealth.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ComponentHealth message.
             * @function verify
             * @memberof opamp.proto.ComponentHealth
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ComponentHealth.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.healthy != null && message.hasOwnProperty("healthy"))
                    if (typeof message.healthy !== "boolean")
                        return "healthy: boolean expected";
                if (message.startTimeUnixNano != null && message.hasOwnProperty("startTimeUnixNano"))
                    if (!$util.isInteger(message.startTimeUnixNano) && !(message.startTimeUnixNano && $util.isInteger(message.startTimeUnixNano.low) && $util.isInteger(message.startTimeUnixNano.high)))
                        return "startTimeUnixNano: integer|Long expected";
                if (message.lastError != null && message.hasOwnProperty("lastError"))
                    if (!$util.isString(message.lastError))
                        return "lastError: string expected";
                if (message.status != null && message.hasOwnProperty("status"))
                    if (!$util.isString(message.status))
                        return "status: string expected";
                if (message.statusTimeUnixNano != null && message.hasOwnProperty("statusTimeUnixNano"))
                    if (!$util.isInteger(message.statusTimeUnixNano) && !(message.statusTimeUnixNano && $util.isInteger(message.statusTimeUnixNano.low) && $util.isInteger(message.statusTimeUnixNano.high)))
                        return "statusTimeUnixNano: integer|Long expected";
                if (message.componentHealthMap != null && message.hasOwnProperty("componentHealthMap")) {
                    if (!$util.isObject(message.componentHealthMap))
                        return "componentHealthMap: object expected";
                    var key = Object.keys(message.componentHealthMap);
                    for (var i = 0; i < key.length; ++i) {
                        var error = $root.opamp.proto.ComponentHealth.verify(message.componentHealthMap[key[i]]);
                        if (error)
                            return "componentHealthMap." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a ComponentHealth message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.ComponentHealth
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.ComponentHealth} ComponentHealth
             */
            ComponentHealth.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.ComponentHealth)
                    return object;
                var message = new $root.opamp.proto.ComponentHealth();
                if (object.healthy != null)
                    message.healthy = Boolean(object.healthy);
                if (object.startTimeUnixNano != null)
                    if ($util.Long)
                        (message.startTimeUnixNano = $util.Long.fromValue(object.startTimeUnixNano)).unsigned = false;
                    else if (typeof object.startTimeUnixNano === "string")
                        message.startTimeUnixNano = parseInt(object.startTimeUnixNano, 10);
                    else if (typeof object.startTimeUnixNano === "number")
                        message.startTimeUnixNano = object.startTimeUnixNano;
                    else if (typeof object.startTimeUnixNano === "object")
                        message.startTimeUnixNano = new $util.LongBits(object.startTimeUnixNano.low >>> 0, object.startTimeUnixNano.high >>> 0).toNumber();
                if (object.lastError != null)
                    message.lastError = String(object.lastError);
                if (object.status != null)
                    message.status = String(object.status);
                if (object.statusTimeUnixNano != null)
                    if ($util.Long)
                        (message.statusTimeUnixNano = $util.Long.fromValue(object.statusTimeUnixNano)).unsigned = false;
                    else if (typeof object.statusTimeUnixNano === "string")
                        message.statusTimeUnixNano = parseInt(object.statusTimeUnixNano, 10);
                    else if (typeof object.statusTimeUnixNano === "number")
                        message.statusTimeUnixNano = object.statusTimeUnixNano;
                    else if (typeof object.statusTimeUnixNano === "object")
                        message.statusTimeUnixNano = new $util.LongBits(object.statusTimeUnixNano.low >>> 0, object.statusTimeUnixNano.high >>> 0).toNumber();
                if (object.componentHealthMap) {
                    if (typeof object.componentHealthMap !== "object")
                        throw TypeError(".opamp.proto.ComponentHealth.componentHealthMap: object expected");
                    message.componentHealthMap = {};
                    for (var keys = Object.keys(object.componentHealthMap), i = 0; i < keys.length; ++i) {
                        if (typeof object.componentHealthMap[keys[i]] !== "object")
                            throw TypeError(".opamp.proto.ComponentHealth.componentHealthMap: object expected");
                        message.componentHealthMap[keys[i]] = $root.opamp.proto.ComponentHealth.fromObject(object.componentHealthMap[keys[i]]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a ComponentHealth message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.ComponentHealth
             * @static
             * @param {opamp.proto.ComponentHealth} message ComponentHealth
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ComponentHealth.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.objects || options.defaults)
                    object.componentHealthMap = {};
                if (options.defaults) {
                    object.healthy = false;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.startTimeUnixNano = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.startTimeUnixNano = options.longs === String ? "0" : 0;
                    object.lastError = "";
                    object.status = "";
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.statusTimeUnixNano = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.statusTimeUnixNano = options.longs === String ? "0" : 0;
                }
                if (message.healthy != null && message.hasOwnProperty("healthy"))
                    object.healthy = message.healthy;
                if (message.startTimeUnixNano != null && message.hasOwnProperty("startTimeUnixNano"))
                    if (typeof message.startTimeUnixNano === "number")
                        object.startTimeUnixNano = options.longs === String ? String(message.startTimeUnixNano) : message.startTimeUnixNano;
                    else
                        object.startTimeUnixNano = options.longs === String ? $util.Long.prototype.toString.call(message.startTimeUnixNano) : options.longs === Number ? new $util.LongBits(message.startTimeUnixNano.low >>> 0, message.startTimeUnixNano.high >>> 0).toNumber() : message.startTimeUnixNano;
                if (message.lastError != null && message.hasOwnProperty("lastError"))
                    object.lastError = message.lastError;
                if (message.status != null && message.hasOwnProperty("status"))
                    object.status = message.status;
                if (message.statusTimeUnixNano != null && message.hasOwnProperty("statusTimeUnixNano"))
                    if (typeof message.statusTimeUnixNano === "number")
                        object.statusTimeUnixNano = options.longs === String ? String(message.statusTimeUnixNano) : message.statusTimeUnixNano;
                    else
                        object.statusTimeUnixNano = options.longs === String ? $util.Long.prototype.toString.call(message.statusTimeUnixNano) : options.longs === Number ? new $util.LongBits(message.statusTimeUnixNano.low >>> 0, message.statusTimeUnixNano.high >>> 0).toNumber() : message.statusTimeUnixNano;
                var keys2;
                if (message.componentHealthMap && (keys2 = Object.keys(message.componentHealthMap)).length) {
                    object.componentHealthMap = {};
                    for (var j = 0; j < keys2.length; ++j)
                        object.componentHealthMap[keys2[j]] = $root.opamp.proto.ComponentHealth.toObject(message.componentHealthMap[keys2[j]], options);
                }
                return object;
            };

            /**
             * Converts this ComponentHealth to JSON.
             * @function toJSON
             * @memberof opamp.proto.ComponentHealth
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ComponentHealth.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ComponentHealth
             * @function getTypeUrl
             * @memberof opamp.proto.ComponentHealth
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ComponentHealth.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.ComponentHealth";
            };

            return ComponentHealth;
        })();

        proto.EffectiveConfig = (function() {

            /**
             * Properties of an EffectiveConfig.
             * @memberof opamp.proto
             * @interface IEffectiveConfig
             * @property {opamp.proto.IAgentConfigMap|null} [configMap] EffectiveConfig configMap
             */

            /**
             * Constructs a new EffectiveConfig.
             * @memberof opamp.proto
             * @classdesc Represents an EffectiveConfig.
             * @implements IEffectiveConfig
             * @constructor
             * @param {opamp.proto.IEffectiveConfig=} [properties] Properties to set
             */
            function EffectiveConfig(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * EffectiveConfig configMap.
             * @member {opamp.proto.IAgentConfigMap|null|undefined} configMap
             * @memberof opamp.proto.EffectiveConfig
             * @instance
             */
            EffectiveConfig.prototype.configMap = null;

            /**
             * Creates a new EffectiveConfig instance using the specified properties.
             * @function create
             * @memberof opamp.proto.EffectiveConfig
             * @static
             * @param {opamp.proto.IEffectiveConfig=} [properties] Properties to set
             * @returns {opamp.proto.EffectiveConfig} EffectiveConfig instance
             */
            EffectiveConfig.create = function create(properties) {
                return new EffectiveConfig(properties);
            };

            /**
             * Encodes the specified EffectiveConfig message. Does not implicitly {@link opamp.proto.EffectiveConfig.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.EffectiveConfig
             * @static
             * @param {opamp.proto.IEffectiveConfig} message EffectiveConfig message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            EffectiveConfig.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.configMap != null && Object.hasOwnProperty.call(message, "configMap"))
                    $root.opamp.proto.AgentConfigMap.encode(message.configMap, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified EffectiveConfig message, length delimited. Does not implicitly {@link opamp.proto.EffectiveConfig.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.EffectiveConfig
             * @static
             * @param {opamp.proto.IEffectiveConfig} message EffectiveConfig message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            EffectiveConfig.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an EffectiveConfig message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.EffectiveConfig
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.EffectiveConfig} EffectiveConfig
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            EffectiveConfig.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.EffectiveConfig();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.configMap = $root.opamp.proto.AgentConfigMap.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an EffectiveConfig message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.EffectiveConfig
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.EffectiveConfig} EffectiveConfig
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            EffectiveConfig.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an EffectiveConfig message.
             * @function verify
             * @memberof opamp.proto.EffectiveConfig
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            EffectiveConfig.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.configMap != null && message.hasOwnProperty("configMap")) {
                    var error = $root.opamp.proto.AgentConfigMap.verify(message.configMap);
                    if (error)
                        return "configMap." + error;
                }
                return null;
            };

            /**
             * Creates an EffectiveConfig message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.EffectiveConfig
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.EffectiveConfig} EffectiveConfig
             */
            EffectiveConfig.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.EffectiveConfig)
                    return object;
                var message = new $root.opamp.proto.EffectiveConfig();
                if (object.configMap != null) {
                    if (typeof object.configMap !== "object")
                        throw TypeError(".opamp.proto.EffectiveConfig.configMap: object expected");
                    message.configMap = $root.opamp.proto.AgentConfigMap.fromObject(object.configMap);
                }
                return message;
            };

            /**
             * Creates a plain object from an EffectiveConfig message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.EffectiveConfig
             * @static
             * @param {opamp.proto.EffectiveConfig} message EffectiveConfig
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            EffectiveConfig.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.configMap = null;
                if (message.configMap != null && message.hasOwnProperty("configMap"))
                    object.configMap = $root.opamp.proto.AgentConfigMap.toObject(message.configMap, options);
                return object;
            };

            /**
             * Converts this EffectiveConfig to JSON.
             * @function toJSON
             * @memberof opamp.proto.EffectiveConfig
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            EffectiveConfig.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for EffectiveConfig
             * @function getTypeUrl
             * @memberof opamp.proto.EffectiveConfig
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            EffectiveConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.EffectiveConfig";
            };

            return EffectiveConfig;
        })();

        proto.RemoteConfigStatus = (function() {

            /**
             * Properties of a RemoteConfigStatus.
             * @memberof opamp.proto
             * @interface IRemoteConfigStatus
             * @property {Uint8Array|null} [lastRemoteConfigHash] RemoteConfigStatus lastRemoteConfigHash
             * @property {opamp.proto.RemoteConfigStatuses|null} [status] RemoteConfigStatus status
             * @property {string|null} [errorMessage] RemoteConfigStatus errorMessage
             */

            /**
             * Constructs a new RemoteConfigStatus.
             * @memberof opamp.proto
             * @classdesc Represents a RemoteConfigStatus.
             * @implements IRemoteConfigStatus
             * @constructor
             * @param {opamp.proto.IRemoteConfigStatus=} [properties] Properties to set
             */
            function RemoteConfigStatus(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * RemoteConfigStatus lastRemoteConfigHash.
             * @member {Uint8Array} lastRemoteConfigHash
             * @memberof opamp.proto.RemoteConfigStatus
             * @instance
             */
            RemoteConfigStatus.prototype.lastRemoteConfigHash = $util.newBuffer([]);

            /**
             * RemoteConfigStatus status.
             * @member {opamp.proto.RemoteConfigStatuses} status
             * @memberof opamp.proto.RemoteConfigStatus
             * @instance
             */
            RemoteConfigStatus.prototype.status = 0;

            /**
             * RemoteConfigStatus errorMessage.
             * @member {string} errorMessage
             * @memberof opamp.proto.RemoteConfigStatus
             * @instance
             */
            RemoteConfigStatus.prototype.errorMessage = "";

            /**
             * Creates a new RemoteConfigStatus instance using the specified properties.
             * @function create
             * @memberof opamp.proto.RemoteConfigStatus
             * @static
             * @param {opamp.proto.IRemoteConfigStatus=} [properties] Properties to set
             * @returns {opamp.proto.RemoteConfigStatus} RemoteConfigStatus instance
             */
            RemoteConfigStatus.create = function create(properties) {
                return new RemoteConfigStatus(properties);
            };

            /**
             * Encodes the specified RemoteConfigStatus message. Does not implicitly {@link opamp.proto.RemoteConfigStatus.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.RemoteConfigStatus
             * @static
             * @param {opamp.proto.IRemoteConfigStatus} message RemoteConfigStatus message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            RemoteConfigStatus.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.lastRemoteConfigHash != null && Object.hasOwnProperty.call(message, "lastRemoteConfigHash"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.lastRemoteConfigHash);
                if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.status);
                if (message.errorMessage != null && Object.hasOwnProperty.call(message, "errorMessage"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.errorMessage);
                return writer;
            };

            /**
             * Encodes the specified RemoteConfigStatus message, length delimited. Does not implicitly {@link opamp.proto.RemoteConfigStatus.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.RemoteConfigStatus
             * @static
             * @param {opamp.proto.IRemoteConfigStatus} message RemoteConfigStatus message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            RemoteConfigStatus.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a RemoteConfigStatus message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.RemoteConfigStatus
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.RemoteConfigStatus} RemoteConfigStatus
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            RemoteConfigStatus.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.RemoteConfigStatus();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.lastRemoteConfigHash = reader.bytes();
                            break;
                        }
                    case 2: {
                            message.status = reader.int32();
                            break;
                        }
                    case 3: {
                            message.errorMessage = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a RemoteConfigStatus message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.RemoteConfigStatus
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.RemoteConfigStatus} RemoteConfigStatus
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            RemoteConfigStatus.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a RemoteConfigStatus message.
             * @function verify
             * @memberof opamp.proto.RemoteConfigStatus
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            RemoteConfigStatus.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.lastRemoteConfigHash != null && message.hasOwnProperty("lastRemoteConfigHash"))
                    if (!(message.lastRemoteConfigHash && typeof message.lastRemoteConfigHash.length === "number" || $util.isString(message.lastRemoteConfigHash)))
                        return "lastRemoteConfigHash: buffer expected";
                if (message.status != null && message.hasOwnProperty("status"))
                    switch (message.status) {
                    default:
                        return "status: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                        break;
                    }
                if (message.errorMessage != null && message.hasOwnProperty("errorMessage"))
                    if (!$util.isString(message.errorMessage))
                        return "errorMessage: string expected";
                return null;
            };

            /**
             * Creates a RemoteConfigStatus message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.RemoteConfigStatus
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.RemoteConfigStatus} RemoteConfigStatus
             */
            RemoteConfigStatus.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.RemoteConfigStatus)
                    return object;
                var message = new $root.opamp.proto.RemoteConfigStatus();
                if (object.lastRemoteConfigHash != null)
                    if (typeof object.lastRemoteConfigHash === "string")
                        $util.base64.decode(object.lastRemoteConfigHash, message.lastRemoteConfigHash = $util.newBuffer($util.base64.length(object.lastRemoteConfigHash)), 0);
                    else if (object.lastRemoteConfigHash.length >= 0)
                        message.lastRemoteConfigHash = object.lastRemoteConfigHash;
                switch (object.status) {
                default:
                    if (typeof object.status === "number") {
                        message.status = object.status;
                        break;
                    }
                    break;
                case "RemoteConfigStatuses_UNSET":
                case 0:
                    message.status = 0;
                    break;
                case "RemoteConfigStatuses_APPLIED":
                case 1:
                    message.status = 1;
                    break;
                case "RemoteConfigStatuses_APPLYING":
                case 2:
                    message.status = 2;
                    break;
                case "RemoteConfigStatuses_FAILED":
                case 3:
                    message.status = 3;
                    break;
                }
                if (object.errorMessage != null)
                    message.errorMessage = String(object.errorMessage);
                return message;
            };

            /**
             * Creates a plain object from a RemoteConfigStatus message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.RemoteConfigStatus
             * @static
             * @param {opamp.proto.RemoteConfigStatus} message RemoteConfigStatus
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            RemoteConfigStatus.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    if (options.bytes === String)
                        object.lastRemoteConfigHash = "";
                    else {
                        object.lastRemoteConfigHash = [];
                        if (options.bytes !== Array)
                            object.lastRemoteConfigHash = $util.newBuffer(object.lastRemoteConfigHash);
                    }
                    object.status = options.enums === String ? "RemoteConfigStatuses_UNSET" : 0;
                    object.errorMessage = "";
                }
                if (message.lastRemoteConfigHash != null && message.hasOwnProperty("lastRemoteConfigHash"))
                    object.lastRemoteConfigHash = options.bytes === String ? $util.base64.encode(message.lastRemoteConfigHash, 0, message.lastRemoteConfigHash.length) : options.bytes === Array ? Array.prototype.slice.call(message.lastRemoteConfigHash) : message.lastRemoteConfigHash;
                if (message.status != null && message.hasOwnProperty("status"))
                    object.status = options.enums === String ? $root.opamp.proto.RemoteConfigStatuses[message.status] === undefined ? message.status : $root.opamp.proto.RemoteConfigStatuses[message.status] : message.status;
                if (message.errorMessage != null && message.hasOwnProperty("errorMessage"))
                    object.errorMessage = message.errorMessage;
                return object;
            };

            /**
             * Converts this RemoteConfigStatus to JSON.
             * @function toJSON
             * @memberof opamp.proto.RemoteConfigStatus
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            RemoteConfigStatus.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for RemoteConfigStatus
             * @function getTypeUrl
             * @memberof opamp.proto.RemoteConfigStatus
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            RemoteConfigStatus.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.RemoteConfigStatus";
            };

            return RemoteConfigStatus;
        })();

        proto.ConnectionSettingsStatus = (function() {

            /**
             * Properties of a ConnectionSettingsStatus.
             * @memberof opamp.proto
             * @interface IConnectionSettingsStatus
             * @property {Uint8Array|null} [lastConnectionSettingsHash] ConnectionSettingsStatus lastConnectionSettingsHash
             * @property {opamp.proto.ConnectionSettingsStatuses|null} [status] ConnectionSettingsStatus status
             * @property {string|null} [errorMessage] ConnectionSettingsStatus errorMessage
             */

            /**
             * Constructs a new ConnectionSettingsStatus.
             * @memberof opamp.proto
             * @classdesc Represents a ConnectionSettingsStatus.
             * @implements IConnectionSettingsStatus
             * @constructor
             * @param {opamp.proto.IConnectionSettingsStatus=} [properties] Properties to set
             */
            function ConnectionSettingsStatus(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ConnectionSettingsStatus lastConnectionSettingsHash.
             * @member {Uint8Array} lastConnectionSettingsHash
             * @memberof opamp.proto.ConnectionSettingsStatus
             * @instance
             */
            ConnectionSettingsStatus.prototype.lastConnectionSettingsHash = $util.newBuffer([]);

            /**
             * ConnectionSettingsStatus status.
             * @member {opamp.proto.ConnectionSettingsStatuses} status
             * @memberof opamp.proto.ConnectionSettingsStatus
             * @instance
             */
            ConnectionSettingsStatus.prototype.status = 0;

            /**
             * ConnectionSettingsStatus errorMessage.
             * @member {string} errorMessage
             * @memberof opamp.proto.ConnectionSettingsStatus
             * @instance
             */
            ConnectionSettingsStatus.prototype.errorMessage = "";

            /**
             * Creates a new ConnectionSettingsStatus instance using the specified properties.
             * @function create
             * @memberof opamp.proto.ConnectionSettingsStatus
             * @static
             * @param {opamp.proto.IConnectionSettingsStatus=} [properties] Properties to set
             * @returns {opamp.proto.ConnectionSettingsStatus} ConnectionSettingsStatus instance
             */
            ConnectionSettingsStatus.create = function create(properties) {
                return new ConnectionSettingsStatus(properties);
            };

            /**
             * Encodes the specified ConnectionSettingsStatus message. Does not implicitly {@link opamp.proto.ConnectionSettingsStatus.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.ConnectionSettingsStatus
             * @static
             * @param {opamp.proto.IConnectionSettingsStatus} message ConnectionSettingsStatus message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ConnectionSettingsStatus.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.lastConnectionSettingsHash != null && Object.hasOwnProperty.call(message, "lastConnectionSettingsHash"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.lastConnectionSettingsHash);
                if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.status);
                if (message.errorMessage != null && Object.hasOwnProperty.call(message, "errorMessage"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.errorMessage);
                return writer;
            };

            /**
             * Encodes the specified ConnectionSettingsStatus message, length delimited. Does not implicitly {@link opamp.proto.ConnectionSettingsStatus.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.ConnectionSettingsStatus
             * @static
             * @param {opamp.proto.IConnectionSettingsStatus} message ConnectionSettingsStatus message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ConnectionSettingsStatus.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ConnectionSettingsStatus message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.ConnectionSettingsStatus
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.ConnectionSettingsStatus} ConnectionSettingsStatus
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ConnectionSettingsStatus.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.ConnectionSettingsStatus();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.lastConnectionSettingsHash = reader.bytes();
                            break;
                        }
                    case 2: {
                            message.status = reader.int32();
                            break;
                        }
                    case 3: {
                            message.errorMessage = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ConnectionSettingsStatus message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.ConnectionSettingsStatus
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.ConnectionSettingsStatus} ConnectionSettingsStatus
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ConnectionSettingsStatus.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ConnectionSettingsStatus message.
             * @function verify
             * @memberof opamp.proto.ConnectionSettingsStatus
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ConnectionSettingsStatus.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.lastConnectionSettingsHash != null && message.hasOwnProperty("lastConnectionSettingsHash"))
                    if (!(message.lastConnectionSettingsHash && typeof message.lastConnectionSettingsHash.length === "number" || $util.isString(message.lastConnectionSettingsHash)))
                        return "lastConnectionSettingsHash: buffer expected";
                if (message.status != null && message.hasOwnProperty("status"))
                    switch (message.status) {
                    default:
                        return "status: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                        break;
                    }
                if (message.errorMessage != null && message.hasOwnProperty("errorMessage"))
                    if (!$util.isString(message.errorMessage))
                        return "errorMessage: string expected";
                return null;
            };

            /**
             * Creates a ConnectionSettingsStatus message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.ConnectionSettingsStatus
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.ConnectionSettingsStatus} ConnectionSettingsStatus
             */
            ConnectionSettingsStatus.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.ConnectionSettingsStatus)
                    return object;
                var message = new $root.opamp.proto.ConnectionSettingsStatus();
                if (object.lastConnectionSettingsHash != null)
                    if (typeof object.lastConnectionSettingsHash === "string")
                        $util.base64.decode(object.lastConnectionSettingsHash, message.lastConnectionSettingsHash = $util.newBuffer($util.base64.length(object.lastConnectionSettingsHash)), 0);
                    else if (object.lastConnectionSettingsHash.length >= 0)
                        message.lastConnectionSettingsHash = object.lastConnectionSettingsHash;
                switch (object.status) {
                default:
                    if (typeof object.status === "number") {
                        message.status = object.status;
                        break;
                    }
                    break;
                case "ConnectionSettingsStatuses_UNSET":
                case 0:
                    message.status = 0;
                    break;
                case "ConnectionSettingsStatuses_APPLIED":
                case 1:
                    message.status = 1;
                    break;
                case "ConnectionSettingsStatuses_APPLYING":
                case 2:
                    message.status = 2;
                    break;
                case "ConnectionSettingsStatuses_FAILED":
                case 3:
                    message.status = 3;
                    break;
                }
                if (object.errorMessage != null)
                    message.errorMessage = String(object.errorMessage);
                return message;
            };

            /**
             * Creates a plain object from a ConnectionSettingsStatus message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.ConnectionSettingsStatus
             * @static
             * @param {opamp.proto.ConnectionSettingsStatus} message ConnectionSettingsStatus
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ConnectionSettingsStatus.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    if (options.bytes === String)
                        object.lastConnectionSettingsHash = "";
                    else {
                        object.lastConnectionSettingsHash = [];
                        if (options.bytes !== Array)
                            object.lastConnectionSettingsHash = $util.newBuffer(object.lastConnectionSettingsHash);
                    }
                    object.status = options.enums === String ? "ConnectionSettingsStatuses_UNSET" : 0;
                    object.errorMessage = "";
                }
                if (message.lastConnectionSettingsHash != null && message.hasOwnProperty("lastConnectionSettingsHash"))
                    object.lastConnectionSettingsHash = options.bytes === String ? $util.base64.encode(message.lastConnectionSettingsHash, 0, message.lastConnectionSettingsHash.length) : options.bytes === Array ? Array.prototype.slice.call(message.lastConnectionSettingsHash) : message.lastConnectionSettingsHash;
                if (message.status != null && message.hasOwnProperty("status"))
                    object.status = options.enums === String ? $root.opamp.proto.ConnectionSettingsStatuses[message.status] === undefined ? message.status : $root.opamp.proto.ConnectionSettingsStatuses[message.status] : message.status;
                if (message.errorMessage != null && message.hasOwnProperty("errorMessage"))
                    object.errorMessage = message.errorMessage;
                return object;
            };

            /**
             * Converts this ConnectionSettingsStatus to JSON.
             * @function toJSON
             * @memberof opamp.proto.ConnectionSettingsStatus
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ConnectionSettingsStatus.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ConnectionSettingsStatus
             * @function getTypeUrl
             * @memberof opamp.proto.ConnectionSettingsStatus
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ConnectionSettingsStatus.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.ConnectionSettingsStatus";
            };

            return ConnectionSettingsStatus;
        })();

        /**
         * ConnectionSettingsStatuses enum.
         * @name opamp.proto.ConnectionSettingsStatuses
         * @enum {number}
         * @property {number} ConnectionSettingsStatuses_UNSET=0 ConnectionSettingsStatuses_UNSET value
         * @property {number} ConnectionSettingsStatuses_APPLIED=1 ConnectionSettingsStatuses_APPLIED value
         * @property {number} ConnectionSettingsStatuses_APPLYING=2 ConnectionSettingsStatuses_APPLYING value
         * @property {number} ConnectionSettingsStatuses_FAILED=3 ConnectionSettingsStatuses_FAILED value
         */
        proto.ConnectionSettingsStatuses = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "ConnectionSettingsStatuses_UNSET"] = 0;
            values[valuesById[1] = "ConnectionSettingsStatuses_APPLIED"] = 1;
            values[valuesById[2] = "ConnectionSettingsStatuses_APPLYING"] = 2;
            values[valuesById[3] = "ConnectionSettingsStatuses_FAILED"] = 3;
            return values;
        })();

        /**
         * RemoteConfigStatuses enum.
         * @name opamp.proto.RemoteConfigStatuses
         * @enum {number}
         * @property {number} RemoteConfigStatuses_UNSET=0 RemoteConfigStatuses_UNSET value
         * @property {number} RemoteConfigStatuses_APPLIED=1 RemoteConfigStatuses_APPLIED value
         * @property {number} RemoteConfigStatuses_APPLYING=2 RemoteConfigStatuses_APPLYING value
         * @property {number} RemoteConfigStatuses_FAILED=3 RemoteConfigStatuses_FAILED value
         */
        proto.RemoteConfigStatuses = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "RemoteConfigStatuses_UNSET"] = 0;
            values[valuesById[1] = "RemoteConfigStatuses_APPLIED"] = 1;
            values[valuesById[2] = "RemoteConfigStatuses_APPLYING"] = 2;
            values[valuesById[3] = "RemoteConfigStatuses_FAILED"] = 3;
            return values;
        })();

        proto.PackageStatuses = (function() {

            /**
             * Properties of a PackageStatuses.
             * @memberof opamp.proto
             * @interface IPackageStatuses
             * @property {Object.<string,opamp.proto.IPackageStatus>|null} [packages] PackageStatuses packages
             * @property {Uint8Array|null} [serverProvidedAllPackagesHash] PackageStatuses serverProvidedAllPackagesHash
             * @property {string|null} [errorMessage] PackageStatuses errorMessage
             */

            /**
             * Constructs a new PackageStatuses.
             * @memberof opamp.proto
             * @classdesc Represents a PackageStatuses.
             * @implements IPackageStatuses
             * @constructor
             * @param {opamp.proto.IPackageStatuses=} [properties] Properties to set
             */
            function PackageStatuses(properties) {
                this.packages = {};
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * PackageStatuses packages.
             * @member {Object.<string,opamp.proto.IPackageStatus>} packages
             * @memberof opamp.proto.PackageStatuses
             * @instance
             */
            PackageStatuses.prototype.packages = $util.emptyObject;

            /**
             * PackageStatuses serverProvidedAllPackagesHash.
             * @member {Uint8Array} serverProvidedAllPackagesHash
             * @memberof opamp.proto.PackageStatuses
             * @instance
             */
            PackageStatuses.prototype.serverProvidedAllPackagesHash = $util.newBuffer([]);

            /**
             * PackageStatuses errorMessage.
             * @member {string} errorMessage
             * @memberof opamp.proto.PackageStatuses
             * @instance
             */
            PackageStatuses.prototype.errorMessage = "";

            /**
             * Creates a new PackageStatuses instance using the specified properties.
             * @function create
             * @memberof opamp.proto.PackageStatuses
             * @static
             * @param {opamp.proto.IPackageStatuses=} [properties] Properties to set
             * @returns {opamp.proto.PackageStatuses} PackageStatuses instance
             */
            PackageStatuses.create = function create(properties) {
                return new PackageStatuses(properties);
            };

            /**
             * Encodes the specified PackageStatuses message. Does not implicitly {@link opamp.proto.PackageStatuses.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.PackageStatuses
             * @static
             * @param {opamp.proto.IPackageStatuses} message PackageStatuses message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PackageStatuses.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.packages != null && Object.hasOwnProperty.call(message, "packages"))
                    for (var keys = Object.keys(message.packages), i = 0; i < keys.length; ++i) {
                        writer.uint32(/* id 1, wireType 2 =*/10).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                        $root.opamp.proto.PackageStatus.encode(message.packages[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                    }
                if (message.serverProvidedAllPackagesHash != null && Object.hasOwnProperty.call(message, "serverProvidedAllPackagesHash"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.serverProvidedAllPackagesHash);
                if (message.errorMessage != null && Object.hasOwnProperty.call(message, "errorMessage"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.errorMessage);
                return writer;
            };

            /**
             * Encodes the specified PackageStatuses message, length delimited. Does not implicitly {@link opamp.proto.PackageStatuses.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.PackageStatuses
             * @static
             * @param {opamp.proto.IPackageStatuses} message PackageStatuses message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PackageStatuses.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a PackageStatuses message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.PackageStatuses
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.PackageStatuses} PackageStatuses
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PackageStatuses.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.PackageStatuses(), key, value;
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (message.packages === $util.emptyObject)
                                message.packages = {};
                            var end2 = reader.uint32() + reader.pos;
                            key = "";
                            value = null;
                            while (reader.pos < end2) {
                                var tag2 = reader.uint32();
                                switch (tag2 >>> 3) {
                                case 1:
                                    key = reader.string();
                                    break;
                                case 2:
                                    value = $root.opamp.proto.PackageStatus.decode(reader, reader.uint32());
                                    break;
                                default:
                                    reader.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            message.packages[key] = value;
                            break;
                        }
                    case 2: {
                            message.serverProvidedAllPackagesHash = reader.bytes();
                            break;
                        }
                    case 3: {
                            message.errorMessage = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a PackageStatuses message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.PackageStatuses
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.PackageStatuses} PackageStatuses
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PackageStatuses.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a PackageStatuses message.
             * @function verify
             * @memberof opamp.proto.PackageStatuses
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            PackageStatuses.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.packages != null && message.hasOwnProperty("packages")) {
                    if (!$util.isObject(message.packages))
                        return "packages: object expected";
                    var key = Object.keys(message.packages);
                    for (var i = 0; i < key.length; ++i) {
                        var error = $root.opamp.proto.PackageStatus.verify(message.packages[key[i]]);
                        if (error)
                            return "packages." + error;
                    }
                }
                if (message.serverProvidedAllPackagesHash != null && message.hasOwnProperty("serverProvidedAllPackagesHash"))
                    if (!(message.serverProvidedAllPackagesHash && typeof message.serverProvidedAllPackagesHash.length === "number" || $util.isString(message.serverProvidedAllPackagesHash)))
                        return "serverProvidedAllPackagesHash: buffer expected";
                if (message.errorMessage != null && message.hasOwnProperty("errorMessage"))
                    if (!$util.isString(message.errorMessage))
                        return "errorMessage: string expected";
                return null;
            };

            /**
             * Creates a PackageStatuses message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.PackageStatuses
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.PackageStatuses} PackageStatuses
             */
            PackageStatuses.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.PackageStatuses)
                    return object;
                var message = new $root.opamp.proto.PackageStatuses();
                if (object.packages) {
                    if (typeof object.packages !== "object")
                        throw TypeError(".opamp.proto.PackageStatuses.packages: object expected");
                    message.packages = {};
                    for (var keys = Object.keys(object.packages), i = 0; i < keys.length; ++i) {
                        if (typeof object.packages[keys[i]] !== "object")
                            throw TypeError(".opamp.proto.PackageStatuses.packages: object expected");
                        message.packages[keys[i]] = $root.opamp.proto.PackageStatus.fromObject(object.packages[keys[i]]);
                    }
                }
                if (object.serverProvidedAllPackagesHash != null)
                    if (typeof object.serverProvidedAllPackagesHash === "string")
                        $util.base64.decode(object.serverProvidedAllPackagesHash, message.serverProvidedAllPackagesHash = $util.newBuffer($util.base64.length(object.serverProvidedAllPackagesHash)), 0);
                    else if (object.serverProvidedAllPackagesHash.length >= 0)
                        message.serverProvidedAllPackagesHash = object.serverProvidedAllPackagesHash;
                if (object.errorMessage != null)
                    message.errorMessage = String(object.errorMessage);
                return message;
            };

            /**
             * Creates a plain object from a PackageStatuses message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.PackageStatuses
             * @static
             * @param {opamp.proto.PackageStatuses} message PackageStatuses
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            PackageStatuses.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.objects || options.defaults)
                    object.packages = {};
                if (options.defaults) {
                    if (options.bytes === String)
                        object.serverProvidedAllPackagesHash = "";
                    else {
                        object.serverProvidedAllPackagesHash = [];
                        if (options.bytes !== Array)
                            object.serverProvidedAllPackagesHash = $util.newBuffer(object.serverProvidedAllPackagesHash);
                    }
                    object.errorMessage = "";
                }
                var keys2;
                if (message.packages && (keys2 = Object.keys(message.packages)).length) {
                    object.packages = {};
                    for (var j = 0; j < keys2.length; ++j)
                        object.packages[keys2[j]] = $root.opamp.proto.PackageStatus.toObject(message.packages[keys2[j]], options);
                }
                if (message.serverProvidedAllPackagesHash != null && message.hasOwnProperty("serverProvidedAllPackagesHash"))
                    object.serverProvidedAllPackagesHash = options.bytes === String ? $util.base64.encode(message.serverProvidedAllPackagesHash, 0, message.serverProvidedAllPackagesHash.length) : options.bytes === Array ? Array.prototype.slice.call(message.serverProvidedAllPackagesHash) : message.serverProvidedAllPackagesHash;
                if (message.errorMessage != null && message.hasOwnProperty("errorMessage"))
                    object.errorMessage = message.errorMessage;
                return object;
            };

            /**
             * Converts this PackageStatuses to JSON.
             * @function toJSON
             * @memberof opamp.proto.PackageStatuses
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            PackageStatuses.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for PackageStatuses
             * @function getTypeUrl
             * @memberof opamp.proto.PackageStatuses
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            PackageStatuses.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.PackageStatuses";
            };

            return PackageStatuses;
        })();

        proto.PackageStatus = (function() {

            /**
             * Properties of a PackageStatus.
             * @memberof opamp.proto
             * @interface IPackageStatus
             * @property {string|null} [name] PackageStatus name
             * @property {string|null} [agentHasVersion] PackageStatus agentHasVersion
             * @property {Uint8Array|null} [agentHasHash] PackageStatus agentHasHash
             * @property {string|null} [serverOfferedVersion] PackageStatus serverOfferedVersion
             * @property {Uint8Array|null} [serverOfferedHash] PackageStatus serverOfferedHash
             * @property {opamp.proto.PackageStatusEnum|null} [status] PackageStatus status
             * @property {string|null} [errorMessage] PackageStatus errorMessage
             * @property {opamp.proto.IPackageDownloadDetails|null} [downloadDetails] PackageStatus downloadDetails
             */

            /**
             * Constructs a new PackageStatus.
             * @memberof opamp.proto
             * @classdesc Represents a PackageStatus.
             * @implements IPackageStatus
             * @constructor
             * @param {opamp.proto.IPackageStatus=} [properties] Properties to set
             */
            function PackageStatus(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * PackageStatus name.
             * @member {string} name
             * @memberof opamp.proto.PackageStatus
             * @instance
             */
            PackageStatus.prototype.name = "";

            /**
             * PackageStatus agentHasVersion.
             * @member {string} agentHasVersion
             * @memberof opamp.proto.PackageStatus
             * @instance
             */
            PackageStatus.prototype.agentHasVersion = "";

            /**
             * PackageStatus agentHasHash.
             * @member {Uint8Array} agentHasHash
             * @memberof opamp.proto.PackageStatus
             * @instance
             */
            PackageStatus.prototype.agentHasHash = $util.newBuffer([]);

            /**
             * PackageStatus serverOfferedVersion.
             * @member {string} serverOfferedVersion
             * @memberof opamp.proto.PackageStatus
             * @instance
             */
            PackageStatus.prototype.serverOfferedVersion = "";

            /**
             * PackageStatus serverOfferedHash.
             * @member {Uint8Array} serverOfferedHash
             * @memberof opamp.proto.PackageStatus
             * @instance
             */
            PackageStatus.prototype.serverOfferedHash = $util.newBuffer([]);

            /**
             * PackageStatus status.
             * @member {opamp.proto.PackageStatusEnum} status
             * @memberof opamp.proto.PackageStatus
             * @instance
             */
            PackageStatus.prototype.status = 0;

            /**
             * PackageStatus errorMessage.
             * @member {string} errorMessage
             * @memberof opamp.proto.PackageStatus
             * @instance
             */
            PackageStatus.prototype.errorMessage = "";

            /**
             * PackageStatus downloadDetails.
             * @member {opamp.proto.IPackageDownloadDetails|null|undefined} downloadDetails
             * @memberof opamp.proto.PackageStatus
             * @instance
             */
            PackageStatus.prototype.downloadDetails = null;

            /**
             * Creates a new PackageStatus instance using the specified properties.
             * @function create
             * @memberof opamp.proto.PackageStatus
             * @static
             * @param {opamp.proto.IPackageStatus=} [properties] Properties to set
             * @returns {opamp.proto.PackageStatus} PackageStatus instance
             */
            PackageStatus.create = function create(properties) {
                return new PackageStatus(properties);
            };

            /**
             * Encodes the specified PackageStatus message. Does not implicitly {@link opamp.proto.PackageStatus.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.PackageStatus
             * @static
             * @param {opamp.proto.IPackageStatus} message PackageStatus message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PackageStatus.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
                if (message.agentHasVersion != null && Object.hasOwnProperty.call(message, "agentHasVersion"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.agentHasVersion);
                if (message.agentHasHash != null && Object.hasOwnProperty.call(message, "agentHasHash"))
                    writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.agentHasHash);
                if (message.serverOfferedVersion != null && Object.hasOwnProperty.call(message, "serverOfferedVersion"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.serverOfferedVersion);
                if (message.serverOfferedHash != null && Object.hasOwnProperty.call(message, "serverOfferedHash"))
                    writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.serverOfferedHash);
                if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                    writer.uint32(/* id 6, wireType 0 =*/48).int32(message.status);
                if (message.errorMessage != null && Object.hasOwnProperty.call(message, "errorMessage"))
                    writer.uint32(/* id 7, wireType 2 =*/58).string(message.errorMessage);
                if (message.downloadDetails != null && Object.hasOwnProperty.call(message, "downloadDetails"))
                    $root.opamp.proto.PackageDownloadDetails.encode(message.downloadDetails, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified PackageStatus message, length delimited. Does not implicitly {@link opamp.proto.PackageStatus.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.PackageStatus
             * @static
             * @param {opamp.proto.IPackageStatus} message PackageStatus message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PackageStatus.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a PackageStatus message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.PackageStatus
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.PackageStatus} PackageStatus
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PackageStatus.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.PackageStatus();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.name = reader.string();
                            break;
                        }
                    case 2: {
                            message.agentHasVersion = reader.string();
                            break;
                        }
                    case 3: {
                            message.agentHasHash = reader.bytes();
                            break;
                        }
                    case 4: {
                            message.serverOfferedVersion = reader.string();
                            break;
                        }
                    case 5: {
                            message.serverOfferedHash = reader.bytes();
                            break;
                        }
                    case 6: {
                            message.status = reader.int32();
                            break;
                        }
                    case 7: {
                            message.errorMessage = reader.string();
                            break;
                        }
                    case 8: {
                            message.downloadDetails = $root.opamp.proto.PackageDownloadDetails.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a PackageStatus message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.PackageStatus
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.PackageStatus} PackageStatus
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PackageStatus.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a PackageStatus message.
             * @function verify
             * @memberof opamp.proto.PackageStatus
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            PackageStatus.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                if (message.agentHasVersion != null && message.hasOwnProperty("agentHasVersion"))
                    if (!$util.isString(message.agentHasVersion))
                        return "agentHasVersion: string expected";
                if (message.agentHasHash != null && message.hasOwnProperty("agentHasHash"))
                    if (!(message.agentHasHash && typeof message.agentHasHash.length === "number" || $util.isString(message.agentHasHash)))
                        return "agentHasHash: buffer expected";
                if (message.serverOfferedVersion != null && message.hasOwnProperty("serverOfferedVersion"))
                    if (!$util.isString(message.serverOfferedVersion))
                        return "serverOfferedVersion: string expected";
                if (message.serverOfferedHash != null && message.hasOwnProperty("serverOfferedHash"))
                    if (!(message.serverOfferedHash && typeof message.serverOfferedHash.length === "number" || $util.isString(message.serverOfferedHash)))
                        return "serverOfferedHash: buffer expected";
                if (message.status != null && message.hasOwnProperty("status"))
                    switch (message.status) {
                    default:
                        return "status: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        break;
                    }
                if (message.errorMessage != null && message.hasOwnProperty("errorMessage"))
                    if (!$util.isString(message.errorMessage))
                        return "errorMessage: string expected";
                if (message.downloadDetails != null && message.hasOwnProperty("downloadDetails")) {
                    var error = $root.opamp.proto.PackageDownloadDetails.verify(message.downloadDetails);
                    if (error)
                        return "downloadDetails." + error;
                }
                return null;
            };

            /**
             * Creates a PackageStatus message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.PackageStatus
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.PackageStatus} PackageStatus
             */
            PackageStatus.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.PackageStatus)
                    return object;
                var message = new $root.opamp.proto.PackageStatus();
                if (object.name != null)
                    message.name = String(object.name);
                if (object.agentHasVersion != null)
                    message.agentHasVersion = String(object.agentHasVersion);
                if (object.agentHasHash != null)
                    if (typeof object.agentHasHash === "string")
                        $util.base64.decode(object.agentHasHash, message.agentHasHash = $util.newBuffer($util.base64.length(object.agentHasHash)), 0);
                    else if (object.agentHasHash.length >= 0)
                        message.agentHasHash = object.agentHasHash;
                if (object.serverOfferedVersion != null)
                    message.serverOfferedVersion = String(object.serverOfferedVersion);
                if (object.serverOfferedHash != null)
                    if (typeof object.serverOfferedHash === "string")
                        $util.base64.decode(object.serverOfferedHash, message.serverOfferedHash = $util.newBuffer($util.base64.length(object.serverOfferedHash)), 0);
                    else if (object.serverOfferedHash.length >= 0)
                        message.serverOfferedHash = object.serverOfferedHash;
                switch (object.status) {
                default:
                    if (typeof object.status === "number") {
                        message.status = object.status;
                        break;
                    }
                    break;
                case "PackageStatusEnum_Installed":
                case 0:
                    message.status = 0;
                    break;
                case "PackageStatusEnum_InstallPending":
                case 1:
                    message.status = 1;
                    break;
                case "PackageStatusEnum_Installing":
                case 2:
                    message.status = 2;
                    break;
                case "PackageStatusEnum_InstallFailed":
                case 3:
                    message.status = 3;
                    break;
                case "PackageStatusEnum_Downloading":
                case 4:
                    message.status = 4;
                    break;
                }
                if (object.errorMessage != null)
                    message.errorMessage = String(object.errorMessage);
                if (object.downloadDetails != null) {
                    if (typeof object.downloadDetails !== "object")
                        throw TypeError(".opamp.proto.PackageStatus.downloadDetails: object expected");
                    message.downloadDetails = $root.opamp.proto.PackageDownloadDetails.fromObject(object.downloadDetails);
                }
                return message;
            };

            /**
             * Creates a plain object from a PackageStatus message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.PackageStatus
             * @static
             * @param {opamp.proto.PackageStatus} message PackageStatus
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            PackageStatus.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.name = "";
                    object.agentHasVersion = "";
                    if (options.bytes === String)
                        object.agentHasHash = "";
                    else {
                        object.agentHasHash = [];
                        if (options.bytes !== Array)
                            object.agentHasHash = $util.newBuffer(object.agentHasHash);
                    }
                    object.serverOfferedVersion = "";
                    if (options.bytes === String)
                        object.serverOfferedHash = "";
                    else {
                        object.serverOfferedHash = [];
                        if (options.bytes !== Array)
                            object.serverOfferedHash = $util.newBuffer(object.serverOfferedHash);
                    }
                    object.status = options.enums === String ? "PackageStatusEnum_Installed" : 0;
                    object.errorMessage = "";
                    object.downloadDetails = null;
                }
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.agentHasVersion != null && message.hasOwnProperty("agentHasVersion"))
                    object.agentHasVersion = message.agentHasVersion;
                if (message.agentHasHash != null && message.hasOwnProperty("agentHasHash"))
                    object.agentHasHash = options.bytes === String ? $util.base64.encode(message.agentHasHash, 0, message.agentHasHash.length) : options.bytes === Array ? Array.prototype.slice.call(message.agentHasHash) : message.agentHasHash;
                if (message.serverOfferedVersion != null && message.hasOwnProperty("serverOfferedVersion"))
                    object.serverOfferedVersion = message.serverOfferedVersion;
                if (message.serverOfferedHash != null && message.hasOwnProperty("serverOfferedHash"))
                    object.serverOfferedHash = options.bytes === String ? $util.base64.encode(message.serverOfferedHash, 0, message.serverOfferedHash.length) : options.bytes === Array ? Array.prototype.slice.call(message.serverOfferedHash) : message.serverOfferedHash;
                if (message.status != null && message.hasOwnProperty("status"))
                    object.status = options.enums === String ? $root.opamp.proto.PackageStatusEnum[message.status] === undefined ? message.status : $root.opamp.proto.PackageStatusEnum[message.status] : message.status;
                if (message.errorMessage != null && message.hasOwnProperty("errorMessage"))
                    object.errorMessage = message.errorMessage;
                if (message.downloadDetails != null && message.hasOwnProperty("downloadDetails"))
                    object.downloadDetails = $root.opamp.proto.PackageDownloadDetails.toObject(message.downloadDetails, options);
                return object;
            };

            /**
             * Converts this PackageStatus to JSON.
             * @function toJSON
             * @memberof opamp.proto.PackageStatus
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            PackageStatus.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for PackageStatus
             * @function getTypeUrl
             * @memberof opamp.proto.PackageStatus
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            PackageStatus.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.PackageStatus";
            };

            return PackageStatus;
        })();

        proto.PackageDownloadDetails = (function() {

            /**
             * Properties of a PackageDownloadDetails.
             * @memberof opamp.proto
             * @interface IPackageDownloadDetails
             * @property {number|null} [downloadPercent] PackageDownloadDetails downloadPercent
             * @property {number|null} [downloadBytesPerSecond] PackageDownloadDetails downloadBytesPerSecond
             */

            /**
             * Constructs a new PackageDownloadDetails.
             * @memberof opamp.proto
             * @classdesc Represents a PackageDownloadDetails.
             * @implements IPackageDownloadDetails
             * @constructor
             * @param {opamp.proto.IPackageDownloadDetails=} [properties] Properties to set
             */
            function PackageDownloadDetails(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * PackageDownloadDetails downloadPercent.
             * @member {number} downloadPercent
             * @memberof opamp.proto.PackageDownloadDetails
             * @instance
             */
            PackageDownloadDetails.prototype.downloadPercent = 0;

            /**
             * PackageDownloadDetails downloadBytesPerSecond.
             * @member {number} downloadBytesPerSecond
             * @memberof opamp.proto.PackageDownloadDetails
             * @instance
             */
            PackageDownloadDetails.prototype.downloadBytesPerSecond = 0;

            /**
             * Creates a new PackageDownloadDetails instance using the specified properties.
             * @function create
             * @memberof opamp.proto.PackageDownloadDetails
             * @static
             * @param {opamp.proto.IPackageDownloadDetails=} [properties] Properties to set
             * @returns {opamp.proto.PackageDownloadDetails} PackageDownloadDetails instance
             */
            PackageDownloadDetails.create = function create(properties) {
                return new PackageDownloadDetails(properties);
            };

            /**
             * Encodes the specified PackageDownloadDetails message. Does not implicitly {@link opamp.proto.PackageDownloadDetails.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.PackageDownloadDetails
             * @static
             * @param {opamp.proto.IPackageDownloadDetails} message PackageDownloadDetails message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PackageDownloadDetails.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.downloadPercent != null && Object.hasOwnProperty.call(message, "downloadPercent"))
                    writer.uint32(/* id 1, wireType 1 =*/9).double(message.downloadPercent);
                if (message.downloadBytesPerSecond != null && Object.hasOwnProperty.call(message, "downloadBytesPerSecond"))
                    writer.uint32(/* id 2, wireType 1 =*/17).double(message.downloadBytesPerSecond);
                return writer;
            };

            /**
             * Encodes the specified PackageDownloadDetails message, length delimited. Does not implicitly {@link opamp.proto.PackageDownloadDetails.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.PackageDownloadDetails
             * @static
             * @param {opamp.proto.IPackageDownloadDetails} message PackageDownloadDetails message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PackageDownloadDetails.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a PackageDownloadDetails message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.PackageDownloadDetails
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.PackageDownloadDetails} PackageDownloadDetails
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PackageDownloadDetails.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.PackageDownloadDetails();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.downloadPercent = reader.double();
                            break;
                        }
                    case 2: {
                            message.downloadBytesPerSecond = reader.double();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a PackageDownloadDetails message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.PackageDownloadDetails
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.PackageDownloadDetails} PackageDownloadDetails
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PackageDownloadDetails.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a PackageDownloadDetails message.
             * @function verify
             * @memberof opamp.proto.PackageDownloadDetails
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            PackageDownloadDetails.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.downloadPercent != null && message.hasOwnProperty("downloadPercent"))
                    if (typeof message.downloadPercent !== "number")
                        return "downloadPercent: number expected";
                if (message.downloadBytesPerSecond != null && message.hasOwnProperty("downloadBytesPerSecond"))
                    if (typeof message.downloadBytesPerSecond !== "number")
                        return "downloadBytesPerSecond: number expected";
                return null;
            };

            /**
             * Creates a PackageDownloadDetails message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.PackageDownloadDetails
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.PackageDownloadDetails} PackageDownloadDetails
             */
            PackageDownloadDetails.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.PackageDownloadDetails)
                    return object;
                var message = new $root.opamp.proto.PackageDownloadDetails();
                if (object.downloadPercent != null)
                    message.downloadPercent = Number(object.downloadPercent);
                if (object.downloadBytesPerSecond != null)
                    message.downloadBytesPerSecond = Number(object.downloadBytesPerSecond);
                return message;
            };

            /**
             * Creates a plain object from a PackageDownloadDetails message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.PackageDownloadDetails
             * @static
             * @param {opamp.proto.PackageDownloadDetails} message PackageDownloadDetails
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            PackageDownloadDetails.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.downloadPercent = 0;
                    object.downloadBytesPerSecond = 0;
                }
                if (message.downloadPercent != null && message.hasOwnProperty("downloadPercent"))
                    object.downloadPercent = options.json && !isFinite(message.downloadPercent) ? String(message.downloadPercent) : message.downloadPercent;
                if (message.downloadBytesPerSecond != null && message.hasOwnProperty("downloadBytesPerSecond"))
                    object.downloadBytesPerSecond = options.json && !isFinite(message.downloadBytesPerSecond) ? String(message.downloadBytesPerSecond) : message.downloadBytesPerSecond;
                return object;
            };

            /**
             * Converts this PackageDownloadDetails to JSON.
             * @function toJSON
             * @memberof opamp.proto.PackageDownloadDetails
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            PackageDownloadDetails.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for PackageDownloadDetails
             * @function getTypeUrl
             * @memberof opamp.proto.PackageDownloadDetails
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            PackageDownloadDetails.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.PackageDownloadDetails";
            };

            return PackageDownloadDetails;
        })();

        /**
         * PackageStatusEnum enum.
         * @name opamp.proto.PackageStatusEnum
         * @enum {number}
         * @property {number} PackageStatusEnum_Installed=0 PackageStatusEnum_Installed value
         * @property {number} PackageStatusEnum_InstallPending=1 PackageStatusEnum_InstallPending value
         * @property {number} PackageStatusEnum_Installing=2 PackageStatusEnum_Installing value
         * @property {number} PackageStatusEnum_InstallFailed=3 PackageStatusEnum_InstallFailed value
         * @property {number} PackageStatusEnum_Downloading=4 PackageStatusEnum_Downloading value
         */
        proto.PackageStatusEnum = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "PackageStatusEnum_Installed"] = 0;
            values[valuesById[1] = "PackageStatusEnum_InstallPending"] = 1;
            values[valuesById[2] = "PackageStatusEnum_Installing"] = 2;
            values[valuesById[3] = "PackageStatusEnum_InstallFailed"] = 3;
            values[valuesById[4] = "PackageStatusEnum_Downloading"] = 4;
            return values;
        })();

        proto.AgentIdentification = (function() {

            /**
             * Properties of an AgentIdentification.
             * @memberof opamp.proto
             * @interface IAgentIdentification
             * @property {Uint8Array|null} [newInstanceUid] AgentIdentification newInstanceUid
             */

            /**
             * Constructs a new AgentIdentification.
             * @memberof opamp.proto
             * @classdesc Represents an AgentIdentification.
             * @implements IAgentIdentification
             * @constructor
             * @param {opamp.proto.IAgentIdentification=} [properties] Properties to set
             */
            function AgentIdentification(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * AgentIdentification newInstanceUid.
             * @member {Uint8Array} newInstanceUid
             * @memberof opamp.proto.AgentIdentification
             * @instance
             */
            AgentIdentification.prototype.newInstanceUid = $util.newBuffer([]);

            /**
             * Creates a new AgentIdentification instance using the specified properties.
             * @function create
             * @memberof opamp.proto.AgentIdentification
             * @static
             * @param {opamp.proto.IAgentIdentification=} [properties] Properties to set
             * @returns {opamp.proto.AgentIdentification} AgentIdentification instance
             */
            AgentIdentification.create = function create(properties) {
                return new AgentIdentification(properties);
            };

            /**
             * Encodes the specified AgentIdentification message. Does not implicitly {@link opamp.proto.AgentIdentification.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.AgentIdentification
             * @static
             * @param {opamp.proto.IAgentIdentification} message AgentIdentification message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AgentIdentification.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.newInstanceUid != null && Object.hasOwnProperty.call(message, "newInstanceUid"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.newInstanceUid);
                return writer;
            };

            /**
             * Encodes the specified AgentIdentification message, length delimited. Does not implicitly {@link opamp.proto.AgentIdentification.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.AgentIdentification
             * @static
             * @param {opamp.proto.IAgentIdentification} message AgentIdentification message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AgentIdentification.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an AgentIdentification message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.AgentIdentification
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.AgentIdentification} AgentIdentification
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AgentIdentification.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.AgentIdentification();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.newInstanceUid = reader.bytes();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an AgentIdentification message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.AgentIdentification
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.AgentIdentification} AgentIdentification
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AgentIdentification.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an AgentIdentification message.
             * @function verify
             * @memberof opamp.proto.AgentIdentification
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            AgentIdentification.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.newInstanceUid != null && message.hasOwnProperty("newInstanceUid"))
                    if (!(message.newInstanceUid && typeof message.newInstanceUid.length === "number" || $util.isString(message.newInstanceUid)))
                        return "newInstanceUid: buffer expected";
                return null;
            };

            /**
             * Creates an AgentIdentification message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.AgentIdentification
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.AgentIdentification} AgentIdentification
             */
            AgentIdentification.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.AgentIdentification)
                    return object;
                var message = new $root.opamp.proto.AgentIdentification();
                if (object.newInstanceUid != null)
                    if (typeof object.newInstanceUid === "string")
                        $util.base64.decode(object.newInstanceUid, message.newInstanceUid = $util.newBuffer($util.base64.length(object.newInstanceUid)), 0);
                    else if (object.newInstanceUid.length >= 0)
                        message.newInstanceUid = object.newInstanceUid;
                return message;
            };

            /**
             * Creates a plain object from an AgentIdentification message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.AgentIdentification
             * @static
             * @param {opamp.proto.AgentIdentification} message AgentIdentification
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            AgentIdentification.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    if (options.bytes === String)
                        object.newInstanceUid = "";
                    else {
                        object.newInstanceUid = [];
                        if (options.bytes !== Array)
                            object.newInstanceUid = $util.newBuffer(object.newInstanceUid);
                    }
                if (message.newInstanceUid != null && message.hasOwnProperty("newInstanceUid"))
                    object.newInstanceUid = options.bytes === String ? $util.base64.encode(message.newInstanceUid, 0, message.newInstanceUid.length) : options.bytes === Array ? Array.prototype.slice.call(message.newInstanceUid) : message.newInstanceUid;
                return object;
            };

            /**
             * Converts this AgentIdentification to JSON.
             * @function toJSON
             * @memberof opamp.proto.AgentIdentification
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            AgentIdentification.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for AgentIdentification
             * @function getTypeUrl
             * @memberof opamp.proto.AgentIdentification
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            AgentIdentification.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.AgentIdentification";
            };

            return AgentIdentification;
        })();

        proto.AgentRemoteConfig = (function() {

            /**
             * Properties of an AgentRemoteConfig.
             * @memberof opamp.proto
             * @interface IAgentRemoteConfig
             * @property {opamp.proto.IAgentConfigMap|null} [config] AgentRemoteConfig config
             * @property {Uint8Array|null} [configHash] AgentRemoteConfig configHash
             */

            /**
             * Constructs a new AgentRemoteConfig.
             * @memberof opamp.proto
             * @classdesc Represents an AgentRemoteConfig.
             * @implements IAgentRemoteConfig
             * @constructor
             * @param {opamp.proto.IAgentRemoteConfig=} [properties] Properties to set
             */
            function AgentRemoteConfig(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * AgentRemoteConfig config.
             * @member {opamp.proto.IAgentConfigMap|null|undefined} config
             * @memberof opamp.proto.AgentRemoteConfig
             * @instance
             */
            AgentRemoteConfig.prototype.config = null;

            /**
             * AgentRemoteConfig configHash.
             * @member {Uint8Array} configHash
             * @memberof opamp.proto.AgentRemoteConfig
             * @instance
             */
            AgentRemoteConfig.prototype.configHash = $util.newBuffer([]);

            /**
             * Creates a new AgentRemoteConfig instance using the specified properties.
             * @function create
             * @memberof opamp.proto.AgentRemoteConfig
             * @static
             * @param {opamp.proto.IAgentRemoteConfig=} [properties] Properties to set
             * @returns {opamp.proto.AgentRemoteConfig} AgentRemoteConfig instance
             */
            AgentRemoteConfig.create = function create(properties) {
                return new AgentRemoteConfig(properties);
            };

            /**
             * Encodes the specified AgentRemoteConfig message. Does not implicitly {@link opamp.proto.AgentRemoteConfig.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.AgentRemoteConfig
             * @static
             * @param {opamp.proto.IAgentRemoteConfig} message AgentRemoteConfig message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AgentRemoteConfig.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.config != null && Object.hasOwnProperty.call(message, "config"))
                    $root.opamp.proto.AgentConfigMap.encode(message.config, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.configHash != null && Object.hasOwnProperty.call(message, "configHash"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.configHash);
                return writer;
            };

            /**
             * Encodes the specified AgentRemoteConfig message, length delimited. Does not implicitly {@link opamp.proto.AgentRemoteConfig.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.AgentRemoteConfig
             * @static
             * @param {opamp.proto.IAgentRemoteConfig} message AgentRemoteConfig message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AgentRemoteConfig.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an AgentRemoteConfig message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.AgentRemoteConfig
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.AgentRemoteConfig} AgentRemoteConfig
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AgentRemoteConfig.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.AgentRemoteConfig();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.config = $root.opamp.proto.AgentConfigMap.decode(reader, reader.uint32());
                            break;
                        }
                    case 2: {
                            message.configHash = reader.bytes();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an AgentRemoteConfig message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.AgentRemoteConfig
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.AgentRemoteConfig} AgentRemoteConfig
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AgentRemoteConfig.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an AgentRemoteConfig message.
             * @function verify
             * @memberof opamp.proto.AgentRemoteConfig
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            AgentRemoteConfig.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.config != null && message.hasOwnProperty("config")) {
                    var error = $root.opamp.proto.AgentConfigMap.verify(message.config);
                    if (error)
                        return "config." + error;
                }
                if (message.configHash != null && message.hasOwnProperty("configHash"))
                    if (!(message.configHash && typeof message.configHash.length === "number" || $util.isString(message.configHash)))
                        return "configHash: buffer expected";
                return null;
            };

            /**
             * Creates an AgentRemoteConfig message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.AgentRemoteConfig
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.AgentRemoteConfig} AgentRemoteConfig
             */
            AgentRemoteConfig.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.AgentRemoteConfig)
                    return object;
                var message = new $root.opamp.proto.AgentRemoteConfig();
                if (object.config != null) {
                    if (typeof object.config !== "object")
                        throw TypeError(".opamp.proto.AgentRemoteConfig.config: object expected");
                    message.config = $root.opamp.proto.AgentConfigMap.fromObject(object.config);
                }
                if (object.configHash != null)
                    if (typeof object.configHash === "string")
                        $util.base64.decode(object.configHash, message.configHash = $util.newBuffer($util.base64.length(object.configHash)), 0);
                    else if (object.configHash.length >= 0)
                        message.configHash = object.configHash;
                return message;
            };

            /**
             * Creates a plain object from an AgentRemoteConfig message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.AgentRemoteConfig
             * @static
             * @param {opamp.proto.AgentRemoteConfig} message AgentRemoteConfig
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            AgentRemoteConfig.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.config = null;
                    if (options.bytes === String)
                        object.configHash = "";
                    else {
                        object.configHash = [];
                        if (options.bytes !== Array)
                            object.configHash = $util.newBuffer(object.configHash);
                    }
                }
                if (message.config != null && message.hasOwnProperty("config"))
                    object.config = $root.opamp.proto.AgentConfigMap.toObject(message.config, options);
                if (message.configHash != null && message.hasOwnProperty("configHash"))
                    object.configHash = options.bytes === String ? $util.base64.encode(message.configHash, 0, message.configHash.length) : options.bytes === Array ? Array.prototype.slice.call(message.configHash) : message.configHash;
                return object;
            };

            /**
             * Converts this AgentRemoteConfig to JSON.
             * @function toJSON
             * @memberof opamp.proto.AgentRemoteConfig
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            AgentRemoteConfig.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for AgentRemoteConfig
             * @function getTypeUrl
             * @memberof opamp.proto.AgentRemoteConfig
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            AgentRemoteConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.AgentRemoteConfig";
            };

            return AgentRemoteConfig;
        })();

        proto.AgentConfigMap = (function() {

            /**
             * Properties of an AgentConfigMap.
             * @memberof opamp.proto
             * @interface IAgentConfigMap
             * @property {Object.<string,opamp.proto.IAgentConfigFile>|null} [configMap] AgentConfigMap configMap
             */

            /**
             * Constructs a new AgentConfigMap.
             * @memberof opamp.proto
             * @classdesc Represents an AgentConfigMap.
             * @implements IAgentConfigMap
             * @constructor
             * @param {opamp.proto.IAgentConfigMap=} [properties] Properties to set
             */
            function AgentConfigMap(properties) {
                this.configMap = {};
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * AgentConfigMap configMap.
             * @member {Object.<string,opamp.proto.IAgentConfigFile>} configMap
             * @memberof opamp.proto.AgentConfigMap
             * @instance
             */
            AgentConfigMap.prototype.configMap = $util.emptyObject;

            /**
             * Creates a new AgentConfigMap instance using the specified properties.
             * @function create
             * @memberof opamp.proto.AgentConfigMap
             * @static
             * @param {opamp.proto.IAgentConfigMap=} [properties] Properties to set
             * @returns {opamp.proto.AgentConfigMap} AgentConfigMap instance
             */
            AgentConfigMap.create = function create(properties) {
                return new AgentConfigMap(properties);
            };

            /**
             * Encodes the specified AgentConfigMap message. Does not implicitly {@link opamp.proto.AgentConfigMap.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.AgentConfigMap
             * @static
             * @param {opamp.proto.IAgentConfigMap} message AgentConfigMap message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AgentConfigMap.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.configMap != null && Object.hasOwnProperty.call(message, "configMap"))
                    for (var keys = Object.keys(message.configMap), i = 0; i < keys.length; ++i) {
                        writer.uint32(/* id 1, wireType 2 =*/10).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                        $root.opamp.proto.AgentConfigFile.encode(message.configMap[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                    }
                return writer;
            };

            /**
             * Encodes the specified AgentConfigMap message, length delimited. Does not implicitly {@link opamp.proto.AgentConfigMap.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.AgentConfigMap
             * @static
             * @param {opamp.proto.IAgentConfigMap} message AgentConfigMap message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AgentConfigMap.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an AgentConfigMap message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.AgentConfigMap
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.AgentConfigMap} AgentConfigMap
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AgentConfigMap.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.AgentConfigMap(), key, value;
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (message.configMap === $util.emptyObject)
                                message.configMap = {};
                            var end2 = reader.uint32() + reader.pos;
                            key = "";
                            value = null;
                            while (reader.pos < end2) {
                                var tag2 = reader.uint32();
                                switch (tag2 >>> 3) {
                                case 1:
                                    key = reader.string();
                                    break;
                                case 2:
                                    value = $root.opamp.proto.AgentConfigFile.decode(reader, reader.uint32());
                                    break;
                                default:
                                    reader.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            message.configMap[key] = value;
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an AgentConfigMap message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.AgentConfigMap
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.AgentConfigMap} AgentConfigMap
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AgentConfigMap.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an AgentConfigMap message.
             * @function verify
             * @memberof opamp.proto.AgentConfigMap
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            AgentConfigMap.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.configMap != null && message.hasOwnProperty("configMap")) {
                    if (!$util.isObject(message.configMap))
                        return "configMap: object expected";
                    var key = Object.keys(message.configMap);
                    for (var i = 0; i < key.length; ++i) {
                        var error = $root.opamp.proto.AgentConfigFile.verify(message.configMap[key[i]]);
                        if (error)
                            return "configMap." + error;
                    }
                }
                return null;
            };

            /**
             * Creates an AgentConfigMap message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.AgentConfigMap
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.AgentConfigMap} AgentConfigMap
             */
            AgentConfigMap.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.AgentConfigMap)
                    return object;
                var message = new $root.opamp.proto.AgentConfigMap();
                if (object.configMap) {
                    if (typeof object.configMap !== "object")
                        throw TypeError(".opamp.proto.AgentConfigMap.configMap: object expected");
                    message.configMap = {};
                    for (var keys = Object.keys(object.configMap), i = 0; i < keys.length; ++i) {
                        if (typeof object.configMap[keys[i]] !== "object")
                            throw TypeError(".opamp.proto.AgentConfigMap.configMap: object expected");
                        message.configMap[keys[i]] = $root.opamp.proto.AgentConfigFile.fromObject(object.configMap[keys[i]]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from an AgentConfigMap message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.AgentConfigMap
             * @static
             * @param {opamp.proto.AgentConfigMap} message AgentConfigMap
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            AgentConfigMap.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.objects || options.defaults)
                    object.configMap = {};
                var keys2;
                if (message.configMap && (keys2 = Object.keys(message.configMap)).length) {
                    object.configMap = {};
                    for (var j = 0; j < keys2.length; ++j)
                        object.configMap[keys2[j]] = $root.opamp.proto.AgentConfigFile.toObject(message.configMap[keys2[j]], options);
                }
                return object;
            };

            /**
             * Converts this AgentConfigMap to JSON.
             * @function toJSON
             * @memberof opamp.proto.AgentConfigMap
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            AgentConfigMap.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for AgentConfigMap
             * @function getTypeUrl
             * @memberof opamp.proto.AgentConfigMap
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            AgentConfigMap.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.AgentConfigMap";
            };

            return AgentConfigMap;
        })();

        proto.AgentConfigFile = (function() {

            /**
             * Properties of an AgentConfigFile.
             * @memberof opamp.proto
             * @interface IAgentConfigFile
             * @property {Uint8Array|null} [body] AgentConfigFile body
             * @property {string|null} [contentType] AgentConfigFile contentType
             */

            /**
             * Constructs a new AgentConfigFile.
             * @memberof opamp.proto
             * @classdesc Represents an AgentConfigFile.
             * @implements IAgentConfigFile
             * @constructor
             * @param {opamp.proto.IAgentConfigFile=} [properties] Properties to set
             */
            function AgentConfigFile(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * AgentConfigFile body.
             * @member {Uint8Array} body
             * @memberof opamp.proto.AgentConfigFile
             * @instance
             */
            AgentConfigFile.prototype.body = $util.newBuffer([]);

            /**
             * AgentConfigFile contentType.
             * @member {string} contentType
             * @memberof opamp.proto.AgentConfigFile
             * @instance
             */
            AgentConfigFile.prototype.contentType = "";

            /**
             * Creates a new AgentConfigFile instance using the specified properties.
             * @function create
             * @memberof opamp.proto.AgentConfigFile
             * @static
             * @param {opamp.proto.IAgentConfigFile=} [properties] Properties to set
             * @returns {opamp.proto.AgentConfigFile} AgentConfigFile instance
             */
            AgentConfigFile.create = function create(properties) {
                return new AgentConfigFile(properties);
            };

            /**
             * Encodes the specified AgentConfigFile message. Does not implicitly {@link opamp.proto.AgentConfigFile.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.AgentConfigFile
             * @static
             * @param {opamp.proto.IAgentConfigFile} message AgentConfigFile message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AgentConfigFile.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.body != null && Object.hasOwnProperty.call(message, "body"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.body);
                if (message.contentType != null && Object.hasOwnProperty.call(message, "contentType"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.contentType);
                return writer;
            };

            /**
             * Encodes the specified AgentConfigFile message, length delimited. Does not implicitly {@link opamp.proto.AgentConfigFile.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.AgentConfigFile
             * @static
             * @param {opamp.proto.IAgentConfigFile} message AgentConfigFile message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AgentConfigFile.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an AgentConfigFile message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.AgentConfigFile
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.AgentConfigFile} AgentConfigFile
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AgentConfigFile.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.AgentConfigFile();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.body = reader.bytes();
                            break;
                        }
                    case 2: {
                            message.contentType = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an AgentConfigFile message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.AgentConfigFile
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.AgentConfigFile} AgentConfigFile
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AgentConfigFile.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an AgentConfigFile message.
             * @function verify
             * @memberof opamp.proto.AgentConfigFile
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            AgentConfigFile.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.body != null && message.hasOwnProperty("body"))
                    if (!(message.body && typeof message.body.length === "number" || $util.isString(message.body)))
                        return "body: buffer expected";
                if (message.contentType != null && message.hasOwnProperty("contentType"))
                    if (!$util.isString(message.contentType))
                        return "contentType: string expected";
                return null;
            };

            /**
             * Creates an AgentConfigFile message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.AgentConfigFile
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.AgentConfigFile} AgentConfigFile
             */
            AgentConfigFile.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.AgentConfigFile)
                    return object;
                var message = new $root.opamp.proto.AgentConfigFile();
                if (object.body != null)
                    if (typeof object.body === "string")
                        $util.base64.decode(object.body, message.body = $util.newBuffer($util.base64.length(object.body)), 0);
                    else if (object.body.length >= 0)
                        message.body = object.body;
                if (object.contentType != null)
                    message.contentType = String(object.contentType);
                return message;
            };

            /**
             * Creates a plain object from an AgentConfigFile message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.AgentConfigFile
             * @static
             * @param {opamp.proto.AgentConfigFile} message AgentConfigFile
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            AgentConfigFile.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    if (options.bytes === String)
                        object.body = "";
                    else {
                        object.body = [];
                        if (options.bytes !== Array)
                            object.body = $util.newBuffer(object.body);
                    }
                    object.contentType = "";
                }
                if (message.body != null && message.hasOwnProperty("body"))
                    object.body = options.bytes === String ? $util.base64.encode(message.body, 0, message.body.length) : options.bytes === Array ? Array.prototype.slice.call(message.body) : message.body;
                if (message.contentType != null && message.hasOwnProperty("contentType"))
                    object.contentType = message.contentType;
                return object;
            };

            /**
             * Converts this AgentConfigFile to JSON.
             * @function toJSON
             * @memberof opamp.proto.AgentConfigFile
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            AgentConfigFile.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for AgentConfigFile
             * @function getTypeUrl
             * @memberof opamp.proto.AgentConfigFile
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            AgentConfigFile.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.AgentConfigFile";
            };

            return AgentConfigFile;
        })();

        proto.CustomCapabilities = (function() {

            /**
             * Properties of a CustomCapabilities.
             * @memberof opamp.proto
             * @interface ICustomCapabilities
             * @property {Array.<string>|null} [capabilities] CustomCapabilities capabilities
             */

            /**
             * Constructs a new CustomCapabilities.
             * @memberof opamp.proto
             * @classdesc Represents a CustomCapabilities.
             * @implements ICustomCapabilities
             * @constructor
             * @param {opamp.proto.ICustomCapabilities=} [properties] Properties to set
             */
            function CustomCapabilities(properties) {
                this.capabilities = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * CustomCapabilities capabilities.
             * @member {Array.<string>} capabilities
             * @memberof opamp.proto.CustomCapabilities
             * @instance
             */
            CustomCapabilities.prototype.capabilities = $util.emptyArray;

            /**
             * Creates a new CustomCapabilities instance using the specified properties.
             * @function create
             * @memberof opamp.proto.CustomCapabilities
             * @static
             * @param {opamp.proto.ICustomCapabilities=} [properties] Properties to set
             * @returns {opamp.proto.CustomCapabilities} CustomCapabilities instance
             */
            CustomCapabilities.create = function create(properties) {
                return new CustomCapabilities(properties);
            };

            /**
             * Encodes the specified CustomCapabilities message. Does not implicitly {@link opamp.proto.CustomCapabilities.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.CustomCapabilities
             * @static
             * @param {opamp.proto.ICustomCapabilities} message CustomCapabilities message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CustomCapabilities.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.capabilities != null && message.capabilities.length)
                    for (var i = 0; i < message.capabilities.length; ++i)
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.capabilities[i]);
                return writer;
            };

            /**
             * Encodes the specified CustomCapabilities message, length delimited. Does not implicitly {@link opamp.proto.CustomCapabilities.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.CustomCapabilities
             * @static
             * @param {opamp.proto.ICustomCapabilities} message CustomCapabilities message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CustomCapabilities.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CustomCapabilities message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.CustomCapabilities
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.CustomCapabilities} CustomCapabilities
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CustomCapabilities.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.CustomCapabilities();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.capabilities && message.capabilities.length))
                                message.capabilities = [];
                            message.capabilities.push(reader.string());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a CustomCapabilities message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.CustomCapabilities
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.CustomCapabilities} CustomCapabilities
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CustomCapabilities.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a CustomCapabilities message.
             * @function verify
             * @memberof opamp.proto.CustomCapabilities
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CustomCapabilities.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.capabilities != null && message.hasOwnProperty("capabilities")) {
                    if (!Array.isArray(message.capabilities))
                        return "capabilities: array expected";
                    for (var i = 0; i < message.capabilities.length; ++i)
                        if (!$util.isString(message.capabilities[i]))
                            return "capabilities: string[] expected";
                }
                return null;
            };

            /**
             * Creates a CustomCapabilities message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.CustomCapabilities
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.CustomCapabilities} CustomCapabilities
             */
            CustomCapabilities.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.CustomCapabilities)
                    return object;
                var message = new $root.opamp.proto.CustomCapabilities();
                if (object.capabilities) {
                    if (!Array.isArray(object.capabilities))
                        throw TypeError(".opamp.proto.CustomCapabilities.capabilities: array expected");
                    message.capabilities = [];
                    for (var i = 0; i < object.capabilities.length; ++i)
                        message.capabilities[i] = String(object.capabilities[i]);
                }
                return message;
            };

            /**
             * Creates a plain object from a CustomCapabilities message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.CustomCapabilities
             * @static
             * @param {opamp.proto.CustomCapabilities} message CustomCapabilities
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            CustomCapabilities.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.capabilities = [];
                if (message.capabilities && message.capabilities.length) {
                    object.capabilities = [];
                    for (var j = 0; j < message.capabilities.length; ++j)
                        object.capabilities[j] = message.capabilities[j];
                }
                return object;
            };

            /**
             * Converts this CustomCapabilities to JSON.
             * @function toJSON
             * @memberof opamp.proto.CustomCapabilities
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CustomCapabilities.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for CustomCapabilities
             * @function getTypeUrl
             * @memberof opamp.proto.CustomCapabilities
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            CustomCapabilities.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.CustomCapabilities";
            };

            return CustomCapabilities;
        })();

        proto.CustomMessage = (function() {

            /**
             * Properties of a CustomMessage.
             * @memberof opamp.proto
             * @interface ICustomMessage
             * @property {string|null} [capability] CustomMessage capability
             * @property {string|null} [type] CustomMessage type
             * @property {Uint8Array|null} [data] CustomMessage data
             */

            /**
             * Constructs a new CustomMessage.
             * @memberof opamp.proto
             * @classdesc Represents a CustomMessage.
             * @implements ICustomMessage
             * @constructor
             * @param {opamp.proto.ICustomMessage=} [properties] Properties to set
             */
            function CustomMessage(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * CustomMessage capability.
             * @member {string} capability
             * @memberof opamp.proto.CustomMessage
             * @instance
             */
            CustomMessage.prototype.capability = "";

            /**
             * CustomMessage type.
             * @member {string} type
             * @memberof opamp.proto.CustomMessage
             * @instance
             */
            CustomMessage.prototype.type = "";

            /**
             * CustomMessage data.
             * @member {Uint8Array} data
             * @memberof opamp.proto.CustomMessage
             * @instance
             */
            CustomMessage.prototype.data = $util.newBuffer([]);

            /**
             * Creates a new CustomMessage instance using the specified properties.
             * @function create
             * @memberof opamp.proto.CustomMessage
             * @static
             * @param {opamp.proto.ICustomMessage=} [properties] Properties to set
             * @returns {opamp.proto.CustomMessage} CustomMessage instance
             */
            CustomMessage.create = function create(properties) {
                return new CustomMessage(properties);
            };

            /**
             * Encodes the specified CustomMessage message. Does not implicitly {@link opamp.proto.CustomMessage.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.CustomMessage
             * @static
             * @param {opamp.proto.ICustomMessage} message CustomMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CustomMessage.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.capability != null && Object.hasOwnProperty.call(message, "capability"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.capability);
                if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.type);
                if (message.data != null && Object.hasOwnProperty.call(message, "data"))
                    writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.data);
                return writer;
            };

            /**
             * Encodes the specified CustomMessage message, length delimited. Does not implicitly {@link opamp.proto.CustomMessage.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.CustomMessage
             * @static
             * @param {opamp.proto.ICustomMessage} message CustomMessage message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CustomMessage.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CustomMessage message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.CustomMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.CustomMessage} CustomMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CustomMessage.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.CustomMessage();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.capability = reader.string();
                            break;
                        }
                    case 2: {
                            message.type = reader.string();
                            break;
                        }
                    case 3: {
                            message.data = reader.bytes();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a CustomMessage message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.CustomMessage
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.CustomMessage} CustomMessage
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CustomMessage.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a CustomMessage message.
             * @function verify
             * @memberof opamp.proto.CustomMessage
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CustomMessage.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.capability != null && message.hasOwnProperty("capability"))
                    if (!$util.isString(message.capability))
                        return "capability: string expected";
                if (message.type != null && message.hasOwnProperty("type"))
                    if (!$util.isString(message.type))
                        return "type: string expected";
                if (message.data != null && message.hasOwnProperty("data"))
                    if (!(message.data && typeof message.data.length === "number" || $util.isString(message.data)))
                        return "data: buffer expected";
                return null;
            };

            /**
             * Creates a CustomMessage message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.CustomMessage
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.CustomMessage} CustomMessage
             */
            CustomMessage.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.CustomMessage)
                    return object;
                var message = new $root.opamp.proto.CustomMessage();
                if (object.capability != null)
                    message.capability = String(object.capability);
                if (object.type != null)
                    message.type = String(object.type);
                if (object.data != null)
                    if (typeof object.data === "string")
                        $util.base64.decode(object.data, message.data = $util.newBuffer($util.base64.length(object.data)), 0);
                    else if (object.data.length >= 0)
                        message.data = object.data;
                return message;
            };

            /**
             * Creates a plain object from a CustomMessage message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.CustomMessage
             * @static
             * @param {opamp.proto.CustomMessage} message CustomMessage
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            CustomMessage.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.capability = "";
                    object.type = "";
                    if (options.bytes === String)
                        object.data = "";
                    else {
                        object.data = [];
                        if (options.bytes !== Array)
                            object.data = $util.newBuffer(object.data);
                    }
                }
                if (message.capability != null && message.hasOwnProperty("capability"))
                    object.capability = message.capability;
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = message.type;
                if (message.data != null && message.hasOwnProperty("data"))
                    object.data = options.bytes === String ? $util.base64.encode(message.data, 0, message.data.length) : options.bytes === Array ? Array.prototype.slice.call(message.data) : message.data;
                return object;
            };

            /**
             * Converts this CustomMessage to JSON.
             * @function toJSON
             * @memberof opamp.proto.CustomMessage
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CustomMessage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for CustomMessage
             * @function getTypeUrl
             * @memberof opamp.proto.CustomMessage
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            CustomMessage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.CustomMessage";
            };

            return CustomMessage;
        })();

        proto.AnyValue = (function() {

            /**
             * Properties of an AnyValue.
             * @memberof opamp.proto
             * @interface IAnyValue
             * @property {string|null} [stringValue] AnyValue stringValue
             * @property {boolean|null} [boolValue] AnyValue boolValue
             * @property {number|Long|null} [intValue] AnyValue intValue
             * @property {number|null} [doubleValue] AnyValue doubleValue
             * @property {opamp.proto.IArrayValue|null} [arrayValue] AnyValue arrayValue
             * @property {opamp.proto.IKeyValueList|null} [kvlistValue] AnyValue kvlistValue
             * @property {Uint8Array|null} [bytesValue] AnyValue bytesValue
             */

            /**
             * Constructs a new AnyValue.
             * @memberof opamp.proto
             * @classdesc Represents an AnyValue.
             * @implements IAnyValue
             * @constructor
             * @param {opamp.proto.IAnyValue=} [properties] Properties to set
             */
            function AnyValue(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * AnyValue stringValue.
             * @member {string|null|undefined} stringValue
             * @memberof opamp.proto.AnyValue
             * @instance
             */
            AnyValue.prototype.stringValue = null;

            /**
             * AnyValue boolValue.
             * @member {boolean|null|undefined} boolValue
             * @memberof opamp.proto.AnyValue
             * @instance
             */
            AnyValue.prototype.boolValue = null;

            /**
             * AnyValue intValue.
             * @member {number|Long|null|undefined} intValue
             * @memberof opamp.proto.AnyValue
             * @instance
             */
            AnyValue.prototype.intValue = null;

            /**
             * AnyValue doubleValue.
             * @member {number|null|undefined} doubleValue
             * @memberof opamp.proto.AnyValue
             * @instance
             */
            AnyValue.prototype.doubleValue = null;

            /**
             * AnyValue arrayValue.
             * @member {opamp.proto.IArrayValue|null|undefined} arrayValue
             * @memberof opamp.proto.AnyValue
             * @instance
             */
            AnyValue.prototype.arrayValue = null;

            /**
             * AnyValue kvlistValue.
             * @member {opamp.proto.IKeyValueList|null|undefined} kvlistValue
             * @memberof opamp.proto.AnyValue
             * @instance
             */
            AnyValue.prototype.kvlistValue = null;

            /**
             * AnyValue bytesValue.
             * @member {Uint8Array|null|undefined} bytesValue
             * @memberof opamp.proto.AnyValue
             * @instance
             */
            AnyValue.prototype.bytesValue = null;

            // OneOf field names bound to virtual getters and setters
            var $oneOfFields;

            /**
             * AnyValue value.
             * @member {"stringValue"|"boolValue"|"intValue"|"doubleValue"|"arrayValue"|"kvlistValue"|"bytesValue"|undefined} value
             * @memberof opamp.proto.AnyValue
             * @instance
             */
            Object.defineProperty(AnyValue.prototype, "value", {
                get: $util.oneOfGetter($oneOfFields = ["stringValue", "boolValue", "intValue", "doubleValue", "arrayValue", "kvlistValue", "bytesValue"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new AnyValue instance using the specified properties.
             * @function create
             * @memberof opamp.proto.AnyValue
             * @static
             * @param {opamp.proto.IAnyValue=} [properties] Properties to set
             * @returns {opamp.proto.AnyValue} AnyValue instance
             */
            AnyValue.create = function create(properties) {
                return new AnyValue(properties);
            };

            /**
             * Encodes the specified AnyValue message. Does not implicitly {@link opamp.proto.AnyValue.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.AnyValue
             * @static
             * @param {opamp.proto.IAnyValue} message AnyValue message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AnyValue.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.stringValue != null && Object.hasOwnProperty.call(message, "stringValue"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.stringValue);
                if (message.boolValue != null && Object.hasOwnProperty.call(message, "boolValue"))
                    writer.uint32(/* id 2, wireType 0 =*/16).bool(message.boolValue);
                if (message.intValue != null && Object.hasOwnProperty.call(message, "intValue"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int64(message.intValue);
                if (message.doubleValue != null && Object.hasOwnProperty.call(message, "doubleValue"))
                    writer.uint32(/* id 4, wireType 1 =*/33).double(message.doubleValue);
                if (message.arrayValue != null && Object.hasOwnProperty.call(message, "arrayValue"))
                    $root.opamp.proto.ArrayValue.encode(message.arrayValue, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                if (message.kvlistValue != null && Object.hasOwnProperty.call(message, "kvlistValue"))
                    $root.opamp.proto.KeyValueList.encode(message.kvlistValue, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                if (message.bytesValue != null && Object.hasOwnProperty.call(message, "bytesValue"))
                    writer.uint32(/* id 7, wireType 2 =*/58).bytes(message.bytesValue);
                return writer;
            };

            /**
             * Encodes the specified AnyValue message, length delimited. Does not implicitly {@link opamp.proto.AnyValue.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.AnyValue
             * @static
             * @param {opamp.proto.IAnyValue} message AnyValue message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AnyValue.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an AnyValue message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.AnyValue
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.AnyValue} AnyValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AnyValue.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.AnyValue();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.stringValue = reader.string();
                            break;
                        }
                    case 2: {
                            message.boolValue = reader.bool();
                            break;
                        }
                    case 3: {
                            message.intValue = reader.int64();
                            break;
                        }
                    case 4: {
                            message.doubleValue = reader.double();
                            break;
                        }
                    case 5: {
                            message.arrayValue = $root.opamp.proto.ArrayValue.decode(reader, reader.uint32());
                            break;
                        }
                    case 6: {
                            message.kvlistValue = $root.opamp.proto.KeyValueList.decode(reader, reader.uint32());
                            break;
                        }
                    case 7: {
                            message.bytesValue = reader.bytes();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an AnyValue message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.AnyValue
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.AnyValue} AnyValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AnyValue.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an AnyValue message.
             * @function verify
             * @memberof opamp.proto.AnyValue
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            AnyValue.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                var properties = {};
                if (message.stringValue != null && message.hasOwnProperty("stringValue")) {
                    properties.value = 1;
                    if (!$util.isString(message.stringValue))
                        return "stringValue: string expected";
                }
                if (message.boolValue != null && message.hasOwnProperty("boolValue")) {
                    if (properties.value === 1)
                        return "value: multiple values";
                    properties.value = 1;
                    if (typeof message.boolValue !== "boolean")
                        return "boolValue: boolean expected";
                }
                if (message.intValue != null && message.hasOwnProperty("intValue")) {
                    if (properties.value === 1)
                        return "value: multiple values";
                    properties.value = 1;
                    if (!$util.isInteger(message.intValue) && !(message.intValue && $util.isInteger(message.intValue.low) && $util.isInteger(message.intValue.high)))
                        return "intValue: integer|Long expected";
                }
                if (message.doubleValue != null && message.hasOwnProperty("doubleValue")) {
                    if (properties.value === 1)
                        return "value: multiple values";
                    properties.value = 1;
                    if (typeof message.doubleValue !== "number")
                        return "doubleValue: number expected";
                }
                if (message.arrayValue != null && message.hasOwnProperty("arrayValue")) {
                    if (properties.value === 1)
                        return "value: multiple values";
                    properties.value = 1;
                    {
                        var error = $root.opamp.proto.ArrayValue.verify(message.arrayValue);
                        if (error)
                            return "arrayValue." + error;
                    }
                }
                if (message.kvlistValue != null && message.hasOwnProperty("kvlistValue")) {
                    if (properties.value === 1)
                        return "value: multiple values";
                    properties.value = 1;
                    {
                        var error = $root.opamp.proto.KeyValueList.verify(message.kvlistValue);
                        if (error)
                            return "kvlistValue." + error;
                    }
                }
                if (message.bytesValue != null && message.hasOwnProperty("bytesValue")) {
                    if (properties.value === 1)
                        return "value: multiple values";
                    properties.value = 1;
                    if (!(message.bytesValue && typeof message.bytesValue.length === "number" || $util.isString(message.bytesValue)))
                        return "bytesValue: buffer expected";
                }
                return null;
            };

            /**
             * Creates an AnyValue message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.AnyValue
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.AnyValue} AnyValue
             */
            AnyValue.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.AnyValue)
                    return object;
                var message = new $root.opamp.proto.AnyValue();
                if (object.stringValue != null)
                    message.stringValue = String(object.stringValue);
                if (object.boolValue != null)
                    message.boolValue = Boolean(object.boolValue);
                if (object.intValue != null)
                    if ($util.Long)
                        (message.intValue = $util.Long.fromValue(object.intValue)).unsigned = false;
                    else if (typeof object.intValue === "string")
                        message.intValue = parseInt(object.intValue, 10);
                    else if (typeof object.intValue === "number")
                        message.intValue = object.intValue;
                    else if (typeof object.intValue === "object")
                        message.intValue = new $util.LongBits(object.intValue.low >>> 0, object.intValue.high >>> 0).toNumber();
                if (object.doubleValue != null)
                    message.doubleValue = Number(object.doubleValue);
                if (object.arrayValue != null) {
                    if (typeof object.arrayValue !== "object")
                        throw TypeError(".opamp.proto.AnyValue.arrayValue: object expected");
                    message.arrayValue = $root.opamp.proto.ArrayValue.fromObject(object.arrayValue);
                }
                if (object.kvlistValue != null) {
                    if (typeof object.kvlistValue !== "object")
                        throw TypeError(".opamp.proto.AnyValue.kvlistValue: object expected");
                    message.kvlistValue = $root.opamp.proto.KeyValueList.fromObject(object.kvlistValue);
                }
                if (object.bytesValue != null)
                    if (typeof object.bytesValue === "string")
                        $util.base64.decode(object.bytesValue, message.bytesValue = $util.newBuffer($util.base64.length(object.bytesValue)), 0);
                    else if (object.bytesValue.length >= 0)
                        message.bytesValue = object.bytesValue;
                return message;
            };

            /**
             * Creates a plain object from an AnyValue message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.AnyValue
             * @static
             * @param {opamp.proto.AnyValue} message AnyValue
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            AnyValue.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (message.stringValue != null && message.hasOwnProperty("stringValue")) {
                    object.stringValue = message.stringValue;
                    if (options.oneofs)
                        object.value = "stringValue";
                }
                if (message.boolValue != null && message.hasOwnProperty("boolValue")) {
                    object.boolValue = message.boolValue;
                    if (options.oneofs)
                        object.value = "boolValue";
                }
                if (message.intValue != null && message.hasOwnProperty("intValue")) {
                    if (typeof message.intValue === "number")
                        object.intValue = options.longs === String ? String(message.intValue) : message.intValue;
                    else
                        object.intValue = options.longs === String ? $util.Long.prototype.toString.call(message.intValue) : options.longs === Number ? new $util.LongBits(message.intValue.low >>> 0, message.intValue.high >>> 0).toNumber() : message.intValue;
                    if (options.oneofs)
                        object.value = "intValue";
                }
                if (message.doubleValue != null && message.hasOwnProperty("doubleValue")) {
                    object.doubleValue = options.json && !isFinite(message.doubleValue) ? String(message.doubleValue) : message.doubleValue;
                    if (options.oneofs)
                        object.value = "doubleValue";
                }
                if (message.arrayValue != null && message.hasOwnProperty("arrayValue")) {
                    object.arrayValue = $root.opamp.proto.ArrayValue.toObject(message.arrayValue, options);
                    if (options.oneofs)
                        object.value = "arrayValue";
                }
                if (message.kvlistValue != null && message.hasOwnProperty("kvlistValue")) {
                    object.kvlistValue = $root.opamp.proto.KeyValueList.toObject(message.kvlistValue, options);
                    if (options.oneofs)
                        object.value = "kvlistValue";
                }
                if (message.bytesValue != null && message.hasOwnProperty("bytesValue")) {
                    object.bytesValue = options.bytes === String ? $util.base64.encode(message.bytesValue, 0, message.bytesValue.length) : options.bytes === Array ? Array.prototype.slice.call(message.bytesValue) : message.bytesValue;
                    if (options.oneofs)
                        object.value = "bytesValue";
                }
                return object;
            };

            /**
             * Converts this AnyValue to JSON.
             * @function toJSON
             * @memberof opamp.proto.AnyValue
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            AnyValue.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for AnyValue
             * @function getTypeUrl
             * @memberof opamp.proto.AnyValue
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            AnyValue.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.AnyValue";
            };

            return AnyValue;
        })();

        proto.ArrayValue = (function() {

            /**
             * Properties of an ArrayValue.
             * @memberof opamp.proto
             * @interface IArrayValue
             * @property {Array.<opamp.proto.IAnyValue>|null} [values] ArrayValue values
             */

            /**
             * Constructs a new ArrayValue.
             * @memberof opamp.proto
             * @classdesc Represents an ArrayValue.
             * @implements IArrayValue
             * @constructor
             * @param {opamp.proto.IArrayValue=} [properties] Properties to set
             */
            function ArrayValue(properties) {
                this.values = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ArrayValue values.
             * @member {Array.<opamp.proto.IAnyValue>} values
             * @memberof opamp.proto.ArrayValue
             * @instance
             */
            ArrayValue.prototype.values = $util.emptyArray;

            /**
             * Creates a new ArrayValue instance using the specified properties.
             * @function create
             * @memberof opamp.proto.ArrayValue
             * @static
             * @param {opamp.proto.IArrayValue=} [properties] Properties to set
             * @returns {opamp.proto.ArrayValue} ArrayValue instance
             */
            ArrayValue.create = function create(properties) {
                return new ArrayValue(properties);
            };

            /**
             * Encodes the specified ArrayValue message. Does not implicitly {@link opamp.proto.ArrayValue.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.ArrayValue
             * @static
             * @param {opamp.proto.IArrayValue} message ArrayValue message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ArrayValue.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.values != null && message.values.length)
                    for (var i = 0; i < message.values.length; ++i)
                        $root.opamp.proto.AnyValue.encode(message.values[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified ArrayValue message, length delimited. Does not implicitly {@link opamp.proto.ArrayValue.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.ArrayValue
             * @static
             * @param {opamp.proto.IArrayValue} message ArrayValue message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ArrayValue.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an ArrayValue message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.ArrayValue
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.ArrayValue} ArrayValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ArrayValue.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.ArrayValue();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.values && message.values.length))
                                message.values = [];
                            message.values.push($root.opamp.proto.AnyValue.decode(reader, reader.uint32()));
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an ArrayValue message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.ArrayValue
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.ArrayValue} ArrayValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ArrayValue.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an ArrayValue message.
             * @function verify
             * @memberof opamp.proto.ArrayValue
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ArrayValue.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.values != null && message.hasOwnProperty("values")) {
                    if (!Array.isArray(message.values))
                        return "values: array expected";
                    for (var i = 0; i < message.values.length; ++i) {
                        var error = $root.opamp.proto.AnyValue.verify(message.values[i]);
                        if (error)
                            return "values." + error;
                    }
                }
                return null;
            };

            /**
             * Creates an ArrayValue message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.ArrayValue
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.ArrayValue} ArrayValue
             */
            ArrayValue.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.ArrayValue)
                    return object;
                var message = new $root.opamp.proto.ArrayValue();
                if (object.values) {
                    if (!Array.isArray(object.values))
                        throw TypeError(".opamp.proto.ArrayValue.values: array expected");
                    message.values = [];
                    for (var i = 0; i < object.values.length; ++i) {
                        if (typeof object.values[i] !== "object")
                            throw TypeError(".opamp.proto.ArrayValue.values: object expected");
                        message.values[i] = $root.opamp.proto.AnyValue.fromObject(object.values[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from an ArrayValue message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.ArrayValue
             * @static
             * @param {opamp.proto.ArrayValue} message ArrayValue
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ArrayValue.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.values = [];
                if (message.values && message.values.length) {
                    object.values = [];
                    for (var j = 0; j < message.values.length; ++j)
                        object.values[j] = $root.opamp.proto.AnyValue.toObject(message.values[j], options);
                }
                return object;
            };

            /**
             * Converts this ArrayValue to JSON.
             * @function toJSON
             * @memberof opamp.proto.ArrayValue
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ArrayValue.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ArrayValue
             * @function getTypeUrl
             * @memberof opamp.proto.ArrayValue
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ArrayValue.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.ArrayValue";
            };

            return ArrayValue;
        })();

        proto.KeyValueList = (function() {

            /**
             * Properties of a KeyValueList.
             * @memberof opamp.proto
             * @interface IKeyValueList
             * @property {Array.<opamp.proto.IKeyValue>|null} [values] KeyValueList values
             */

            /**
             * Constructs a new KeyValueList.
             * @memberof opamp.proto
             * @classdesc Represents a KeyValueList.
             * @implements IKeyValueList
             * @constructor
             * @param {opamp.proto.IKeyValueList=} [properties] Properties to set
             */
            function KeyValueList(properties) {
                this.values = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * KeyValueList values.
             * @member {Array.<opamp.proto.IKeyValue>} values
             * @memberof opamp.proto.KeyValueList
             * @instance
             */
            KeyValueList.prototype.values = $util.emptyArray;

            /**
             * Creates a new KeyValueList instance using the specified properties.
             * @function create
             * @memberof opamp.proto.KeyValueList
             * @static
             * @param {opamp.proto.IKeyValueList=} [properties] Properties to set
             * @returns {opamp.proto.KeyValueList} KeyValueList instance
             */
            KeyValueList.create = function create(properties) {
                return new KeyValueList(properties);
            };

            /**
             * Encodes the specified KeyValueList message. Does not implicitly {@link opamp.proto.KeyValueList.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.KeyValueList
             * @static
             * @param {opamp.proto.IKeyValueList} message KeyValueList message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            KeyValueList.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.values != null && message.values.length)
                    for (var i = 0; i < message.values.length; ++i)
                        $root.opamp.proto.KeyValue.encode(message.values[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified KeyValueList message, length delimited. Does not implicitly {@link opamp.proto.KeyValueList.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.KeyValueList
             * @static
             * @param {opamp.proto.IKeyValueList} message KeyValueList message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            KeyValueList.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a KeyValueList message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.KeyValueList
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.KeyValueList} KeyValueList
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            KeyValueList.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.KeyValueList();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.values && message.values.length))
                                message.values = [];
                            message.values.push($root.opamp.proto.KeyValue.decode(reader, reader.uint32()));
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a KeyValueList message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.KeyValueList
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.KeyValueList} KeyValueList
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            KeyValueList.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a KeyValueList message.
             * @function verify
             * @memberof opamp.proto.KeyValueList
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            KeyValueList.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.values != null && message.hasOwnProperty("values")) {
                    if (!Array.isArray(message.values))
                        return "values: array expected";
                    for (var i = 0; i < message.values.length; ++i) {
                        var error = $root.opamp.proto.KeyValue.verify(message.values[i]);
                        if (error)
                            return "values." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a KeyValueList message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.KeyValueList
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.KeyValueList} KeyValueList
             */
            KeyValueList.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.KeyValueList)
                    return object;
                var message = new $root.opamp.proto.KeyValueList();
                if (object.values) {
                    if (!Array.isArray(object.values))
                        throw TypeError(".opamp.proto.KeyValueList.values: array expected");
                    message.values = [];
                    for (var i = 0; i < object.values.length; ++i) {
                        if (typeof object.values[i] !== "object")
                            throw TypeError(".opamp.proto.KeyValueList.values: object expected");
                        message.values[i] = $root.opamp.proto.KeyValue.fromObject(object.values[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a KeyValueList message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.KeyValueList
             * @static
             * @param {opamp.proto.KeyValueList} message KeyValueList
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            KeyValueList.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.values = [];
                if (message.values && message.values.length) {
                    object.values = [];
                    for (var j = 0; j < message.values.length; ++j)
                        object.values[j] = $root.opamp.proto.KeyValue.toObject(message.values[j], options);
                }
                return object;
            };

            /**
             * Converts this KeyValueList to JSON.
             * @function toJSON
             * @memberof opamp.proto.KeyValueList
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            KeyValueList.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for KeyValueList
             * @function getTypeUrl
             * @memberof opamp.proto.KeyValueList
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            KeyValueList.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.KeyValueList";
            };

            return KeyValueList;
        })();

        proto.KeyValue = (function() {

            /**
             * Properties of a KeyValue.
             * @memberof opamp.proto
             * @interface IKeyValue
             * @property {string|null} [key] KeyValue key
             * @property {opamp.proto.IAnyValue|null} [value] KeyValue value
             */

            /**
             * Constructs a new KeyValue.
             * @memberof opamp.proto
             * @classdesc Represents a KeyValue.
             * @implements IKeyValue
             * @constructor
             * @param {opamp.proto.IKeyValue=} [properties] Properties to set
             */
            function KeyValue(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * KeyValue key.
             * @member {string} key
             * @memberof opamp.proto.KeyValue
             * @instance
             */
            KeyValue.prototype.key = "";

            /**
             * KeyValue value.
             * @member {opamp.proto.IAnyValue|null|undefined} value
             * @memberof opamp.proto.KeyValue
             * @instance
             */
            KeyValue.prototype.value = null;

            /**
             * Creates a new KeyValue instance using the specified properties.
             * @function create
             * @memberof opamp.proto.KeyValue
             * @static
             * @param {opamp.proto.IKeyValue=} [properties] Properties to set
             * @returns {opamp.proto.KeyValue} KeyValue instance
             */
            KeyValue.create = function create(properties) {
                return new KeyValue(properties);
            };

            /**
             * Encodes the specified KeyValue message. Does not implicitly {@link opamp.proto.KeyValue.verify|verify} messages.
             * @function encode
             * @memberof opamp.proto.KeyValue
             * @static
             * @param {opamp.proto.IKeyValue} message KeyValue message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            KeyValue.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.key != null && Object.hasOwnProperty.call(message, "key"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.key);
                if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                    $root.opamp.proto.AnyValue.encode(message.value, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified KeyValue message, length delimited. Does not implicitly {@link opamp.proto.KeyValue.verify|verify} messages.
             * @function encodeDelimited
             * @memberof opamp.proto.KeyValue
             * @static
             * @param {opamp.proto.IKeyValue} message KeyValue message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            KeyValue.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a KeyValue message from the specified reader or buffer.
             * @function decode
             * @memberof opamp.proto.KeyValue
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {opamp.proto.KeyValue} KeyValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            KeyValue.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.opamp.proto.KeyValue();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.key = reader.string();
                            break;
                        }
                    case 2: {
                            message.value = $root.opamp.proto.AnyValue.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a KeyValue message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof opamp.proto.KeyValue
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {opamp.proto.KeyValue} KeyValue
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            KeyValue.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a KeyValue message.
             * @function verify
             * @memberof opamp.proto.KeyValue
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            KeyValue.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.key != null && message.hasOwnProperty("key"))
                    if (!$util.isString(message.key))
                        return "key: string expected";
                if (message.value != null && message.hasOwnProperty("value")) {
                    var error = $root.opamp.proto.AnyValue.verify(message.value);
                    if (error)
                        return "value." + error;
                }
                return null;
            };

            /**
             * Creates a KeyValue message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof opamp.proto.KeyValue
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {opamp.proto.KeyValue} KeyValue
             */
            KeyValue.fromObject = function fromObject(object) {
                if (object instanceof $root.opamp.proto.KeyValue)
                    return object;
                var message = new $root.opamp.proto.KeyValue();
                if (object.key != null)
                    message.key = String(object.key);
                if (object.value != null) {
                    if (typeof object.value !== "object")
                        throw TypeError(".opamp.proto.KeyValue.value: object expected");
                    message.value = $root.opamp.proto.AnyValue.fromObject(object.value);
                }
                return message;
            };

            /**
             * Creates a plain object from a KeyValue message. Also converts values to other types if specified.
             * @function toObject
             * @memberof opamp.proto.KeyValue
             * @static
             * @param {opamp.proto.KeyValue} message KeyValue
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            KeyValue.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.key = "";
                    object.value = null;
                }
                if (message.key != null && message.hasOwnProperty("key"))
                    object.key = message.key;
                if (message.value != null && message.hasOwnProperty("value"))
                    object.value = $root.opamp.proto.AnyValue.toObject(message.value, options);
                return object;
            };

            /**
             * Converts this KeyValue to JSON.
             * @function toJSON
             * @memberof opamp.proto.KeyValue
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            KeyValue.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for KeyValue
             * @function getTypeUrl
             * @memberof opamp.proto.KeyValue
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            KeyValue.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/opamp.proto.KeyValue";
            };

            return KeyValue;
        })();

        return proto;
    })();

    return opamp;
})();

module.exports = $root;
