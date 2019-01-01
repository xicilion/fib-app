/// <reference lib="es2016" />

/// <reference path="../../@types/index.d.ts" />

import json = require('json');
import util = require('util');

import { fill_error, err_info, render_error } from "./err_info";
import { ouputMap } from './mimes';

const _slice = Array.prototype.slice;

function write_success (result: FibApp.FibAppResponse, req: FibApp.FibAppHttpRequest) {
    if (result.success)
        req.response.write(result.success);
}

function fill_undefined_error(req: FibApp.FibAppHttpRequest, cls: FibApp.FibAppORMModel): void {
    fill_error(req, err_info(5000003, {
        classname: cls.model_name,
    }, cls ? cls.cid : -1));
}

export function bind (app: FibApp.FibAppClass) {
    app.filterRequest = function (req: FibApp.FibAppHttpRequest, classname: string) {
        const arglen = arguments.length;
        const earg = _slice.call(arguments, 2, arglen - 1);
        const func: FibApp.FibAppFunctionToBeFilter = arguments[arglen - 1];


        return app.dbPool((db: FibApp.FibAppDb) => {
            let data;

            // check empty data
            if (req.length == 0 && func.length === arglen + 1)
                return fill_error(req,
                    err_info(4000001, {
                        method: req.method
                    }));

            // decode json data
            if (req.length > 0)
                try {
                    data = req.json();
                } catch (e) {
                    return fill_error(req, err_info(4000002));
                }

            // check classname
            let cls  = null
            if (classname) {
                cls = db.models[classname];
                if (cls === undefined)
                    return fill_error(req,
                        err_info(4040001, {
                            classname: classname
                        }));
            }
            
            const _req: FibApp.FibAppReq = {
                session: req.session as FibApp.FibAppSession,
                query: req.query.toJSON(),
                request: req,

                req_resource_type: parse_req_resource_and_hdlr_type(req).requestedResultType,
                req_resource_basecls: classname,
                req_resource_extend: undefined,
                req_resource_handler_type: undefined
            }

            if (is_internal_base_api_fn(app, func)) {
                _req.req_resource_handler_type = 'builtInBaseRest'
            } else if (is_internal_ext_api_fn(app, func)) {
                _req.req_resource_handler_type = 'builtInExtRest'
                _req.req_resource_extend = earg[1]
            } else {
                _req.req_resource_handler_type = 'modelFunction'
            }

            const where = _req.query.where;
            if (where !== undefined)
                try {
                    _req.query.where = json.decode(where as string);
                } catch (e) {
                    return fill_error(req, err_info(4000003));
                }

            const keys = _req.query.keys;
            if (keys !== undefined && typeof keys === 'string')
                _req.query.keys = keys.split(',');

            let result: FibApp.FibAppResponse = null;
            try {
                result = func.apply(undefined, [_req, db, cls].concat(earg, [data]));
            } catch (e) {
                console.error(e.stack);
                if (e.type === 'validation') {
                    result = {
                        error: {
                            code: 5000000,
                            message: e.msg
                        }
                    };
                } else {
                    return fill_error(req, err_info(5000002, {
                        function: "func",
                        classname: classname,
                        message: e.message
                    }, cls ? cls.cid : '-1'));
                }
            }

            if (result.status)
                req.response.statusCode = result.status;

            switch (_req.req_resource_type) {
                case 'json':
                    if (result.error) {
                        fill_error(req, result);
                    } else if (result.hasOwnProperty('success')) {
                        req.response.json(result.success);
                    } else {
                        fill_undefined_error(req, cls)
                    }

                    break
                case 'css':
                    write_success(result, req);
                    break
                case 'js':
                    write_success(result, req);
                    break
                case 'html':
                    if (result.error) {
                        render_error(req, result);
                    } else if (result.hasOwnProperty('success')) {
                        switch (typeof result.success) {
                            default:
                                write_success(result, req);
                                break
                            case 'object':
                                req.response.json(result.success);
                                break
                        }
                    } else {
                        fill_undefined_error(req, cls)
                    }

                    break
            }

            _req.response_headers = util.extend({
                'Content-Type': ouputMap[_req.req_resource_type] || ouputMap.json
            }, _req.response_headers)

            req.response.setHeader(_req.response_headers);
        });
    }
}

export function is_internal_base_api_fn (app: FibApp.FibAppClass, func: any | Function) {
    return [ app.api.get, app.api.post, app.api.put, app.api.del, app.api.find ].includes(func)
}

export function is_internal_ext_api_fn (app: FibApp.FibAppClass, func: any | Function) {
    return [ app.api.eget, app.api.epost, app.api.eput, app.api.edel, app.api.efind ].includes(func)
}

export function parse_req_resource_and_hdlr_type (req: Class_HttpRequest): {
    requestedResultType: FibApp.FibAppReqResourceType,
    requestedPayloadType: FibApp.FibAppReqResourceHandlerType
} {
    const reqAcceptString = (req.firstHeader('Accept') || '').split(';')[0] || ''
    const reqContentTypeString = (req.firstHeader('Content-Type') || '').split(';')[0] || ''

    const contentTypeString = reqAcceptString.split(',')[0] || reqContentTypeString || '';
    
    let requestedResultType: FibApp.FibAppReqResourceType = 'json'
    let requestedPayloadType: FibApp.FibAppReqResourceHandlerType = 'unknown'

    switch (contentTypeString) {
        case 'application/graphql':
            requestedResultType = 'json'
            requestedPayloadType = 'graphql'
            break
        case 'application/json':
            requestedResultType = 'json'
            break
        case 'application/javascript':
        case 'text/javascript':
            requestedResultType = 'js'
            break
        case 'text/html':
        case 'text/xhtml':
            requestedResultType = 'html'
            break
        case 'text/css':
            requestedResultType = 'css'
            break
        default:
            requestedResultType = 'json'
            requestedPayloadType = requestedPayloadType || 'unknown'
            break
    }

    return {
        requestedResultType,
        requestedPayloadType
    }
}