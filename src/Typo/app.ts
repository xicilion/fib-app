/// <reference types="@fibjs/types" />
/// <reference types="fib-session" />
/// <reference types="fib-pool" />
/// <reference types="fib-rpc" />

import type { FxOrmModel } from '@fxjs/orm/typings/Typo/model'
import type { FxOrmNS, FxSqlQuerySubQuery } from '@fxjs/orm/typings/Typo/ORM'
import type { FxOrmQuery } from '@fxjs/orm/typings/Typo/query'
import type { FxOrmInstance } from '@fxjs/orm/typings/Typo/instance'

import type { FibAppACL } from './acl';
import { FxOrmHook } from '@fxjs/orm/typings/Typo/hook';
import { FibAppTest } from './test';

export namespace FibApp {
    export type AppIdType = number | string

    export type UidType = AppIdType
    export type UserRoleName = string

    export interface FibAppSession {
        id?: AppIdType;
        roles?: UserRoleName[];
    }

    export interface FibAppSuccessResponse {
        status?: number;
        success: any;
    }

    export interface FibAppErrorResponse {
        status?: number;
        error: any;
    }

    export interface FibAppResponse<SDT = any> {
        status?: number;
        success?: SDT;
        error?: FibAppFinalError;
    }

    export type FibAppApiFunctionResponse<DT = any> = FibAppResponse<DT>
    export type FibAppModelFunctionResponse<DT = any> = FibAppResponse<{ data: DT, message: string }>
    export type FibAppModelViewServiceCallbackResponse<DT = any> = FibAppResponse<DT>
    export type FibAppModelViewFunctionResponse = FibAppResponse<string>

    export interface FibAppFinalError {
        code: number | string;
        name?: string;
        message: string;

        [extendProperty: string]: any;
    }

    export interface ObjectWithIdField {
        id: AppIdType
        [extraProp: string]: any
    }

    export type IdPayloadVar = ObjectWithIdField | AppIdType
}

export namespace FibApp {
    export type ReqWhere = FxOrmQuery.QueryConditions
    export type ReqWhereExists = FxOrmQuery.ChainWhereExistsInfo[]

    export interface ReqFindByItem {
        extend: string
        on?: FxSqlQuerySubQuery.SubQueryConditions
        where?: FxSqlQuerySubQuery.SubQueryConditions
        options?: FxOrmModel.ModelOptions__Findby
    }

    export interface FilteredFindByInfo<T = any> {
        accessor: string,
        conditions: FxSqlQuerySubQuery.SubQueryConditions
        accessor_payload: FxOrmQuery.IChainFind | FxOrmModel.Model
    }
}

export namespace FibApp {
    export interface FibAppOrmModelFunction {
        (req: FibAppReq, data: FibAppReqData): FibAppModelFunctionResponse
    }

    /* model view function :start */
    export interface FibAppOrmModelViewFunctionRequestInfo {
        base: string
        id: AppIdType
        extend: string
        ext_id: AppIdType
    }
    export interface FibAppOrmModelViewFunction {
        (result: null | FibAppApiFunctionResponse, req: FibAppReq, modelViewFunctionInfo: FibAppOrmModelViewFunctionRequestInfo): FibAppModelViewFunctionResponse
    }
    export interface FibAppOrmModelFunctionHash {
        [fnName: string]: FibAppOrmModelFunction
    }

    export interface FibAppOrmModelViewFunctionDefOptions {
        static?: boolean
        handler: FibAppOrmModelViewFunction
        response_headers?: object
    }
    export type FibAppOrmModelViewFunctionDefinition = FibAppOrmModelViewFunction | FibAppOrmModelViewFunctionDefOptions
    export interface FibAppOrmModelViewFunctionHash {
        get?: FibAppOrmModelViewFunctionDefinition
        find?: FibAppOrmModelViewFunctionDefinition
        eget?: FibAppOrmModelViewFunctionDefinition
        efind?: FibAppOrmModelViewFunctionDefinition

        [fnName: string]: FibAppOrmModelViewFunctionDefinition
    }
    /* model view function :end */

    /* model view service :start */
    export interface FibAppOrmModelViewServiceCallback {
        (req: FibAppReq, data: FibAppReqData): FibAppModelFunctionResponse
    }
    export interface FibAppOrmModelViewServiceHash {
        [fnName: string]: FibAppOrmModelViewServiceCallback
    }
    /* model view service :end */

    export interface FibAppOrmInstance extends FxOrmNS.Instance {
        acl: FibAppACL.ACLDefinition
        oacl: FibAppACL.OACLDefinition
    }

    // keep compatible with definition in '@fxjs/orm'
    export interface AppSpecialDateProperty extends FxOrmNS.ModelPropertyDefinition {
        type: 'date'
        time?: true
    }
    export interface OrigORMDefProperties {
        createdAt?: AppSpecialDateProperty
        updatedAt?: AppSpecialDateProperty
        [key: string]: FxOrmNS.OrigModelPropertyDefinition
    }

    export interface FibAppOrmModelDefOptions extends FxOrmNS.ModelOptions {
        webx?: {
            ACL?: FibAppACL.FibACLDef
            OACL?: FibAppACL.FibOACLDef
            functions?: FibAppOrmModelFunctionHash
            viewFunctions?: FibAppOrmModelViewFunctionHash
            viewServices?: FibAppOrmModelViewServiceHash
            no_graphql?: boolean
            rpc?: FibRpcInvoke.FibRpcFnHash
        }
    }
    export interface ExtendModelWrapper {
        type: 'hasOne' | 'hasMany' | 'extendsTo';
        reversed?: boolean;
        model: FibApp.FibAppORMModel;
        assoc_model: FibApp.FibAppORMModel;
    }
    /**
     * @deprecated
     */
    export interface FibAppFixedOrmExtendModelWrapper extends ExtendModelWrapper {
        model_associated_models: {
            [modelName: string]: FibAppORMModel
        }
    }
    /**
     * @deprecated
     */
    export interface FibAppOrmModelExtendsInfoHash {
        [ext_name: string]: FibAppFixedOrmExtendModelWrapper
    }
    // just for compability
    export type FibAppOrmModelExtendsInfo = FibAppOrmModelExtendsInfoHash
    
    export interface FibAppORMModel extends FxOrmNS.Model {

        $webx: {
            // globally unique class id
            cid: number
            model_name: string
            ACL: FibAppACL.FibACLDef
            OACL: FibAppACL.FibOACLDef
            functions: FibAppOrmModelFunctionHash
            viewFunctions: FibAppOrmModelViewFunctionHash
            viewServices: FibAppOrmModelViewServiceHash
            no_graphql: boolean

            rpc: FibRpcInvoke.FibRpcFnHash
        }
        // @deprecated, use model $webx[xxx] instead
        readonly cid: FibAppORMModel['$webx']['cid']
        readonly model_name: FibAppORMModel['$webx']['model_name']
        readonly ACL: FibAppORMModel['$webx']['ACL']
        readonly OACL: FibAppORMModel['$webx']['OACL']
        readonly functions: FibAppORMModel['$webx']['functions']
        readonly viewFunctions: FibAppORMModel['$webx']['viewFunctions']
        readonly viewServices: FibAppORMModel['$webx']['viewServices']
        readonly no_graphql: FibAppORMModel['$webx']['no_graphql']
    }

    export interface FibAppOrmSettings {
        'app.orm.common_fields.createdBy': string
        'app.orm.common_fields.createdAt': string
        'app.orm.common_fields.updatedAt': string

        [extend_property: string]: any
    }
}

export namespace FibApp {
    export type FibModelCountTypeMACRO = number;

    export type FibAppModelExtendORMFuncName = string;

    export interface FibAppOrmDefineFn {
        (db: FibAppORM): void | FibAppORMModel | any
    }
    export interface AppORMPool<T1> extends FibPoolNS.FibPool<T1> {
        app: FibAppClass
        use(
            defs?: FibAppOrmDefineFn | FibAppOrmDefineFn[],
            opts?: {
                reload?: boolean
            }
        ): FibAppOrmDefineFn[];
    }
    // compatible
    export type AppDBPool<T1> = AppORMPool<T1>

    export interface GraphQLResolverArgs {
        [k: string]: {
            type: Function
        }
    }
    // constant type
    export interface FibAppApiCommnPayload_hasManyArgs extends GraphQLResolverArgs {
        where: { type: Function }
        join_where: { type: Function }
        findby: { type: Function }
        skip: { type: Function }
        limit: { type: Function }
        order: { type: Function }
    }

    export interface FibAppGraphQlPayload_Field {
        [field: string]: {
            // related model's type
            type: string;
            args?: FibAppApiCommnPayload_hasManyArgs;
            // resolved data in communication
            resolve: any;
        }
    }

    export interface FibDataPayload {
        [key: string]: any;
    }
    /* filterable function :start */
    export interface FibAppFilterableViewFunction {
        (req: FibAppReq, db: FibAppORM, cls: null | FibAppORMModel, data: FibAppReqData): FibAppApiFunctionResponse | string;
    }
    export interface FibAppFilterableApiFunction__NullModel {
        (req: FibAppReq, db: FibAppORM, cls: null, data: FibAppReqData): FibAppApiFunctionResponse;
    }
    export interface FibAppFilterableApiFunction__WithModel {
        (req: FibAppReq, db: FibAppORM, cls: FibAppORMModel, data: FibAppReqData): FibAppApiFunctionResponse;
    }
    /* filterable function :end */

    /* internal api function :start */
    export interface FibAppInternalTypedApi__Get<RT = any> {
        (req: FibAppReq, db: FibAppORM, cls: FxOrmNS.Model, id: AppIdType): RT;
    }
    export type FibAppIneternalApiFunction__Get = FibAppInternalTypedApi__Get<FibAppApiFunctionResponse>

    export interface FibAppIneternalApiFunction__Post {
        (req: FibAppReq, db: FibAppORM, cls: FxOrmNS.Model, data: FibAppReqData): FibAppApiFunctionResponse;
    }

    export interface FibAppInternalTypedApi__Find<RT = any> {
        (req: FibAppReq, db: FibAppORM, cls: FxOrmNS.Model): RT;
    }
    export type FibAppIneternalApiFunction__Find = FibAppInternalTypedApi__Find<FibAppApiFunctionResponse>

    export interface FibAppIneternalApiFunction__Put {
        (req: FibAppReq, db: FibAppORM, cls: FxOrmNS.Model, id: AppIdType | FxOrmInstance.Instance, data: FibAppReqData): FibAppApiFunctionResponse;
    }

    export interface FibAppIneternalApiFunction__Del {
        (req: FibAppReq, db: FibAppORM, cls: FxOrmNS.Model, id: AppIdType | FxOrmInstance.Instance): FibAppApiFunctionResponse;
    }

    export interface FibAppInternalTypedApi__Eget<RT = any> {
        (req: FibAppReq, db: FibAppORM, cls: FxOrmNS.Model, id: AppIdType | FxOrmInstance.Instance, extend: FibAppACL.ACLExtendModelNameType, rid?: AppIdType): RT;
    }
    export type FibAppIneternalApiFunction__Eget = FibAppInternalTypedApi__Eget<FibAppApiFunctionResponse>

    export interface FibAppInternalTypedApi__Efind<RT = any> {
        (req: FibAppReq, db: FibAppORM, cls: FxOrmNS.Model, id: AppIdType | FxOrmInstance.Instance, extend: FibAppACL.ACLExtendModelNameType): RT;
    }
    export type FibAppIneternalApiFunction__Efind = FibAppInternalTypedApi__Efind<FibAppApiFunctionResponse>

    export interface FibAppIneternalApiFunction__Epost {
        (req: FibAppReq, db: FibAppORM, cls: FxOrmNS.Model, id: AppIdType | FxOrmInstance.Instance, extend: FibAppACL.ACLExtendModelNameType, data: FibApp.IdPayloadVar | FibDataPayload): FibAppApiFunctionResponse;
    }

    export interface FibAppIneternalApiFunction__Eput {
        (req: FibAppReq, db: FibAppORM, cls: FxOrmNS.Model, id: AppIdType | FxOrmInstance.Instance, extend: FibAppACL.ACLExtendModelNameType, rid: AppIdType, data: FibDataPayload): FibAppApiFunctionResponse;
    }

    export interface FibAppIneternalApiFunction__Edel {
        (req: FibAppReq, db: FibAppORM, cls: FxOrmNS.Model, id: AppIdType | FxOrmInstance.Instance, extend: FibAppACL.ACLExtendModelNameType, rid: AppIdType): FibAppApiFunctionResponse;
    }

    export interface FibAppIneternalApiFunction__Elink {
        (req: FibAppReq, db: FibAppORM, cls: FxOrmNS.Model, id: AppIdType | FxOrmInstance.Instance, extend: FibAppACL.ACLExtendModelNameType, data: FibDataPayload): FibAppApiFunctionResponse;
    }
    /* internal api function :end */

    export interface FibAppInternalApis {
        get?: FibAppIneternalApiFunction__Get
        post?: FibAppIneternalApiFunction__Post
        find?: FibAppIneternalApiFunction__Find
        put?: FibAppIneternalApiFunction__Put
        del?: FibAppIneternalApiFunction__Del

        eget?: FibAppIneternalApiFunction__Eget
        efind?: FibAppIneternalApiFunction__Efind
        epost?: FibAppIneternalApiFunction__Epost
        eput?: FibAppIneternalApiFunction__Eput
        edel?: FibAppIneternalApiFunction__Edel
        elink?: FibAppIneternalApiFunction__Elink

        functionHandler?: {
            (classname: string, func: string): {
                (_req: FibAppReq, db: FibAppORM, cls: FibAppORMModel, data: FibDataPayload): FibAppModelFunctionResponse
            }
        }
    }
    export interface FibAppIneternalApiFindResult<ReponseT = any> {
        count: number
        results: ReponseT[]
    }

    export interface FibAppInternalViewApis {
        get?: FibAppInternalTypedApi__Get<FibAppModelViewFunctionResponse>
        find?: FibAppInternalTypedApi__Find<FibAppModelViewFunctionResponse>
        eget?: FibAppInternalTypedApi__Eget<FibAppModelViewFunctionResponse>
        efind?: FibAppInternalTypedApi__Efind<FibAppModelViewFunctionResponse>
    }

    export interface FibAppModelViewServiceApis {
        [view_service_api: string]: FibAppOrmModelViewServiceHash
    }

    export type FibAppHttpApiCollectionType = FibAppInternalApis | FibAppInternalViewApis

    export interface AppInternalCommunicationObj {
        inst?: FxOrmNS.Instance | null
        acl?: FibAppACL.RoleActDescriptor
        error?: FibAppFinalError
    }
    export interface AppInternalCommunicationError {
        error: FibAppFinalError
    }
    export type FibAppInternalCommObj = AppInternalCommunicationObj
    export interface AppInternalCommunicationExtendObj extends AppInternalCommunicationObj {
        base?: FxOrmNS.Instance
    }
    export type FibAppInternalCommExtendObj = AppInternalCommunicationExtendObj

    export type GraphQLQueryString = string
    export interface FibAppORM extends FxOrmNS.ORM {
        app: FibAppClass
        /* override :start */
        models: { [key: string]: FibAppORMModel };
        /* override :end */

        graphql<T = any> (query: FibApp.GraphQLQueryString, req: FibApp.FibAppHttpRequest): T
        define(name: string, properties: FxOrmModel.ModelPropertyDefinitionHash, opts?: FibAppOrmModelDefOptions): FibAppORMModel;
    }
    // compatible
    export type FibAppDb = FibAppORM

    export type FibAppFunctionToBeFilter = (
        FibAppFilterableApiFunction__WithModel
        | FibAppFilterableApiFunction__NullModel
        | FibAppOrmModelFunction
        | FibAppInternalApiFunction
    )

    export type FibAppInternalApiFunction =
        FibAppIneternalApiFunction__Get
        | FibAppIneternalApiFunction__Find
        | FibAppIneternalApiFunction__Post
        | FibAppIneternalApiFunction__Put
        | FibAppIneternalApiFunction__Del
        | FibAppIneternalApiFunction__Eget
        | FibAppIneternalApiFunction__Efind
        | FibAppIneternalApiFunction__Epost
        | FibAppIneternalApiFunction__Eput
        | FibAppIneternalApiFunction__Edel
        | FibAppIneternalApiFunction__Elink

    export type FibAppSetupChainFn = FibApp.FibAppClass['filterRequest']

    export interface FibAppHookBeforeResponse {
        (req: FibAppReq, responseObj: FibAppResponse): void
    }

    export interface FibAppHttpRequest extends Class_HttpRequest, FibSessionNS.HttpRequest {
        error?: FibAppFinalError
        session: FibApp.FibAppSession/* FibSessionNS.SessionProxy */

        id?: FibRpcJsonRpcSpec.JsonRpcId

        [k: string]: any
    }

    export interface FibAppReqQuery {
        where?: string | FibApp.ReqWhere
        join_where?: FibApp.ReqWhere
        findby?: FibApp.ReqFindByItem
        keys?: string | string[]
        skip?: number
        limit?: number
        // such as '-id', 'person_id'
        order?: string
        /**
         * it's numberType, but it's designed as boolean like count_required
         * @history this is mostly for arg from http get url like
         * 
         * // from http
         * `http://localhost:8080/api/user?count=1`
         */
        count?: number
        /**
         * // from http
         * `http://localhost:8080/api/user?count_required=1&skip=10` -> `count_required = true`
         * `http://localhost:8080/api/user?count_required=0&skip=10` -> `count_required = true`
         * `http://localhost:8080/api/user?count_required=&skip=10` -> `count_required = false`
         */
        count_required?: boolean

        [extraField: string]: any;
    }
    export interface FibAppReqQueryObject extends FibAppReqQuery, Class_object { }

    export interface FibAppReq {
        session: FibAppSession
        query: FibAppReqQuery
        request?: FibAppHttpRequest
        error?: FibAppFinalError

        req_resource_type?: FibAppReqResourceType
        req_resource_handler_type?: FibAppReqResourceHandlerType
        req_resource_basecls?: string
        req_resource_extend?: string

        response_headers?: object

        /* usually used by server side */
        // all_map?: boolean
    }

    export type FibAppReqResourceType = 'unknown' | 'json' | 'html' | 'css' | 'js'

    export type FibAppReqResourceHandlerType =
        'unknown'
        | 'graphql'
        | 'builtInBaseRest' | 'builtInBaseRest'
        | 'builtInExtRest' | 'builtInExtRest'
        | 'modelFunction' | 'ModelFunction'

    export interface FibAppReqData {
        [key: string]: any;
    }

    export interface FibAppWebApiFunctionInModel {
        (requstInfo: FibAppReq, data: FibAppReqData): any;
    }

    export interface FibAppGraphQLTypeMap {
        [typeName: string]: any
    }

    export interface FibAppDbSetupOpts {
        uuid?: boolean
        /* for fib-pool :start */
        maxsize?: number
        timeout?: number
        retry?: boolean
        /* for fib-pool :end */
    }

    export interface FibAppOpts {
        graphqlTypeMap?: FibAppGraphQLTypeMap

        /**
         * @default '/'
         */
        apiPathPrefix?: string
        /**
         * @default '/'
         */
        viewPathPrefix?: string
        /**
         * @default '/'
         */
        graphQLPathPrefix?: string
        /**
         * @default '/'
         * @recommended '/'
         */
        batchPathPrefix?: string
        /**
         * @notice cannot be '/'
         * @default '/rpc'
         */
        rpcPathPrefix?: string
        /**
         * @notice cannot be '/'
         * @default '/websocket'
         */
        websocketPathPrefix?: string

        hooks?: Hooks

        hideErrorStack?: boolean
    }

    export interface WebSocketMessageHandlerContext<DT = any> {
        app: FibApp.FibAppClass,
        data: DT
        /**
         * @description 
         */
        websocket_msg: Class_WebSocketMessage,
        /**
         * @description websocket connection
         */
        websocket: Class_WebSocket
        /**
         * @description websocket's original request
         */
        request: FibApp.FibAppHttpRequest
    }
    export interface Hooks {
        beforeSetupRoute?: FxOrmHook.HookActionCallback
    }

    export interface GetTestRoutingOptions {
        initRouting?: {
            (routing: /* Class_Routing |  */{[k: string]: Function}): void
        }
    }

    export interface GetTestServerOptions extends GetTestRoutingOptions {
        port?: number
    }

    export interface SessionTestServerInfo {
        app: FibAppClass
        server: Class_HttpServer
        routing: Class_Routing
        port: number,
        httpHost: string,
        websocketHost: string,
        /**
         * @alias httpHost
         */
        serverBase: string,
        appUrlBase: string,
        utils: {
            sessionAs: { (sessionInfo: FibAppSession): void }
        }
    }

    export interface FibAppClassTestUtils {
        mountAppToSessionServer: {
            (app: FibAppClass, opts: GetTestServerOptions): SessionTestServerInfo
        }

        getRestClient: (opts: FibAppTest.FibAppTestClientOptions) => FibAppTest.FibAppTestHttpClient

        internalApiResultAssert: {
            ok: (result: FibAppApiFunctionResponse) => void
            fail: (result: FibAppApiFunctionResponse) => void

            // typed: (app: FibAppClass, result: FibAppApiFunctionResponse, internalFunction: FibAppInternalApiFunction) => void
        }
    }

    export interface FibAppClassUtils {
        transform_fieldslist_2_graphql_inner_string(arr: any[]): string
        readonly isDebug: boolean;
    }

    export interface RpcMethod extends FibRpcInvoke.JsonRpcInvokedFunction {
        (params: Fibjs.AnyObject & {
            $session: FibApp.FibAppSession,
            $request: FibApp.FibAppReq
        }): any
    }

    export declare class FibAppClass extends Class_Routing {
        api: FibAppInternalApis;
        viewApi: FibAppInternalViewApis;
        ormPool: AppORMPool<FibAppORM>; 
        // alias of 'ormPool'
        readonly dbPool: AppORMPool<FibAppORM>;
        // alias of 'ormPool'
        readonly db: AppORMPool<FibAppORM>;

        readonly rpcCall: {
            <TS = any, TERR = any>(
                req: FibRpcJsonRpcSpec.RequestPayload | FibApp.FibAppHttpRequest,
                opts?: {
                    sessionid?: FibApp.FibAppHttpRequest['sessionid'] 
                    session?: FibApp.FibAppHttpRequest['session']// FibApp.FibAppSession
                }
            ): TS | FibRpc.FibRpcError<TERR>
        }
        readonly eventor: Class_EventEmitter

        addRpcMethod (name: string, fn: RpcMethod): number
        hasRpcMethod (name: string): boolean
        removeRpcMethod (name: string): number
        allRpcMethodNames (): string[]
        clearRpcMethods (): void

        /* advanced api :start */
        diagram: () => any;
        filterRequest: {
            (origReq: FibAppHttpRequest, classname: string, func: FibAppFilterableApiFunction__WithModel): void;
            (origReq: FibAppHttpRequest, classname: string, func: FibAppFilterableApiFunction__NullModel): void;

            (origReq: FibAppHttpRequest, classname: string, id: AppIdType, func: FibAppInternalApiFunction): void;
            (origReq: FibAppHttpRequest, classname: string, id: AppIdType, extend: string, efunc: FibAppInternalApiFunction): void;
            (origReq: FibAppHttpRequest, classname: string, id: AppIdType, extend: string, rid: AppIdType, efunc: FibAppInternalApiFunction): void;

            (origReq: FibAppHttpRequest, classname: string, func: FibAppFilterableViewFunction): void;
        };
        test: FibAppClassTestUtils;
        utils: FibAppClassUtils;
        /* advanced api :end */

        readonly __opts: FibAppOpts;

        constructor(connStr: string);
        constructor(connStr: string, opts: FibAppDbSetupOpts);
        constructor(connStr: string, appOpts: FibAppOpts, opts: FibAppDbSetupOpts);

        // beforeResponse?: FibAppHookBeforeResponse;
        /**
         * fix lack of
         *  [METHOD](pattern: string, ...args: any[]): Class_Routing
         * in 'fib-types'
         */
        all(pattern: string | object, ...args: any[]): Class_Routing
        get(pattern: string | object, ...args: any[]): Class_Routing
        post(pattern: string | object, ...args: any[]): Class_Routing
        del(pattern: string | object, ...args: any[]): Class_Routing
        put(pattern: string | object, ...args: any[]): Class_Routing
        patch(pattern: string | object, ...args: any[]): Class_Routing
        find(pattern: string | object, ...args: any[]): Class_Routing
    }

    export type FibAppOnTypeString =
        'graphql:fix-orm-type'
}