(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key2 of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key2) && key2 !== except)
          __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // ../../node_modules/algoliasearch/dist/algoliasearch-lite.umd.js
  var require_algoliasearch_lite_umd = __commonJS({
    "../../node_modules/algoliasearch/dist/algoliasearch-lite.umd.js"(exports, module) {
      !function(e2, t3) {
        "object" == typeof exports && "undefined" != typeof module ? module.exports = t3() : "function" == typeof define && define.amd ? define(t3) : (e2 = e2 || self).algoliasearch = t3();
      }(exports, function() {
        "use strict";
        function e2(e3, t4, r3) {
          return t4 in e3 ? Object.defineProperty(e3, t4, { value: r3, enumerable: true, configurable: true, writable: true }) : e3[t4] = r3, e3;
        }
        function t3(e3, t4) {
          var r3 = Object.keys(e3);
          if (Object.getOwnPropertySymbols) {
            var n4 = Object.getOwnPropertySymbols(e3);
            t4 && (n4 = n4.filter(function(t5) {
              return Object.getOwnPropertyDescriptor(e3, t5).enumerable;
            })), r3.push.apply(r3, n4);
          }
          return r3;
        }
        function r2(r3) {
          for (var n4 = 1; n4 < arguments.length; n4++) {
            var o3 = null != arguments[n4] ? arguments[n4] : {};
            n4 % 2 ? t3(Object(o3), true).forEach(function(t4) {
              e2(r3, t4, o3[t4]);
            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(r3, Object.getOwnPropertyDescriptors(o3)) : t3(Object(o3)).forEach(function(e3) {
              Object.defineProperty(r3, e3, Object.getOwnPropertyDescriptor(o3, e3));
            });
          }
          return r3;
        }
        function n3(e3, t4) {
          if (null == e3) return {};
          var r3, n4, o3 = function(e4, t5) {
            if (null == e4) return {};
            var r4, n5, o4 = {}, a4 = Object.keys(e4);
            for (n5 = 0; n5 < a4.length; n5++) r4 = a4[n5], t5.indexOf(r4) >= 0 || (o4[r4] = e4[r4]);
            return o4;
          }(e3, t4);
          if (Object.getOwnPropertySymbols) {
            var a3 = Object.getOwnPropertySymbols(e3);
            for (n4 = 0; n4 < a3.length; n4++) r3 = a3[n4], t4.indexOf(r3) >= 0 || Object.prototype.propertyIsEnumerable.call(e3, r3) && (o3[r3] = e3[r3]);
          }
          return o3;
        }
        function o2(e3, t4) {
          return function(e4) {
            if (Array.isArray(e4)) return e4;
          }(e3) || function(e4, t5) {
            if (!(Symbol.iterator in Object(e4) || "[object Arguments]" === Object.prototype.toString.call(e4))) return;
            var r3 = [], n4 = true, o3 = false, a3 = void 0;
            try {
              for (var u3, i3 = e4[Symbol.iterator](); !(n4 = (u3 = i3.next()).done) && (r3.push(u3.value), !t5 || r3.length !== t5); n4 = true) ;
            } catch (e5) {
              o3 = true, a3 = e5;
            } finally {
              try {
                n4 || null == i3.return || i3.return();
              } finally {
                if (o3) throw a3;
              }
            }
            return r3;
          }(e3, t4) || function() {
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
          }();
        }
        function a2(e3) {
          return function(e4) {
            if (Array.isArray(e4)) {
              for (var t4 = 0, r3 = new Array(e4.length); t4 < e4.length; t4++) r3[t4] = e4[t4];
              return r3;
            }
          }(e3) || function(e4) {
            if (Symbol.iterator in Object(e4) || "[object Arguments]" === Object.prototype.toString.call(e4)) return Array.from(e4);
          }(e3) || function() {
            throw new TypeError("Invalid attempt to spread non-iterable instance");
          }();
        }
        function u2(e3) {
          var t4, r3 = "algoliasearch-client-js-".concat(e3.key), n4 = function() {
            return void 0 === t4 && (t4 = e3.localStorage || window.localStorage), t4;
          }, a3 = function() {
            return JSON.parse(n4().getItem(r3) || "{}");
          }, u3 = function(e4) {
            n4().setItem(r3, JSON.stringify(e4));
          }, i3 = function() {
            var t5 = e3.timeToLive ? 1e3 * e3.timeToLive : null, r4 = a3(), n5 = Object.fromEntries(Object.entries(r4).filter(function(e4) {
              return void 0 !== o2(e4, 2)[1].timestamp;
            }));
            if (u3(n5), t5) {
              var i4 = Object.fromEntries(Object.entries(n5).filter(function(e4) {
                var r5 = o2(e4, 2)[1], n6 = (/* @__PURE__ */ new Date()).getTime();
                return !(r5.timestamp + t5 < n6);
              }));
              u3(i4);
            }
          };
          return { get: function(e4, t5) {
            var r4 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : { miss: function() {
              return Promise.resolve();
            } };
            return Promise.resolve().then(function() {
              i3();
              var t6 = JSON.stringify(e4);
              return a3()[t6];
            }).then(function(e5) {
              return Promise.all([e5 ? e5.value : t5(), void 0 !== e5]);
            }).then(function(e5) {
              var t6 = o2(e5, 2), n5 = t6[0], a4 = t6[1];
              return Promise.all([n5, a4 || r4.miss(n5)]);
            }).then(function(e5) {
              return o2(e5, 1)[0];
            });
          }, set: function(e4, t5) {
            return Promise.resolve().then(function() {
              var o3 = a3();
              return o3[JSON.stringify(e4)] = { timestamp: (/* @__PURE__ */ new Date()).getTime(), value: t5 }, n4().setItem(r3, JSON.stringify(o3)), t5;
            });
          }, delete: function(e4) {
            return Promise.resolve().then(function() {
              var t5 = a3();
              delete t5[JSON.stringify(e4)], n4().setItem(r3, JSON.stringify(t5));
            });
          }, clear: function() {
            return Promise.resolve().then(function() {
              n4().removeItem(r3);
            });
          } };
        }
        function i2(e3) {
          var t4 = a2(e3.caches), r3 = t4.shift();
          return void 0 === r3 ? { get: function(e4, t5) {
            var r4 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : { miss: function() {
              return Promise.resolve();
            } }, n4 = t5();
            return n4.then(function(e5) {
              return Promise.all([e5, r4.miss(e5)]);
            }).then(function(e5) {
              return o2(e5, 1)[0];
            });
          }, set: function(e4, t5) {
            return Promise.resolve(t5);
          }, delete: function(e4) {
            return Promise.resolve();
          }, clear: function() {
            return Promise.resolve();
          } } : { get: function(e4, n4) {
            var o3 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : { miss: function() {
              return Promise.resolve();
            } };
            return r3.get(e4, n4, o3).catch(function() {
              return i2({ caches: t4 }).get(e4, n4, o3);
            });
          }, set: function(e4, n4) {
            return r3.set(e4, n4).catch(function() {
              return i2({ caches: t4 }).set(e4, n4);
            });
          }, delete: function(e4) {
            return r3.delete(e4).catch(function() {
              return i2({ caches: t4 }).delete(e4);
            });
          }, clear: function() {
            return r3.clear().catch(function() {
              return i2({ caches: t4 }).clear();
            });
          } };
        }
        function s2() {
          var e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : { serializable: true }, t4 = {};
          return { get: function(r3, n4) {
            var o3 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : { miss: function() {
              return Promise.resolve();
            } }, a3 = JSON.stringify(r3);
            if (a3 in t4) return Promise.resolve(e3.serializable ? JSON.parse(t4[a3]) : t4[a3]);
            var u3 = n4(), i3 = o3 && o3.miss || function() {
              return Promise.resolve();
            };
            return u3.then(function(e4) {
              return i3(e4);
            }).then(function() {
              return u3;
            });
          }, set: function(r3, n4) {
            return t4[JSON.stringify(r3)] = e3.serializable ? JSON.stringify(n4) : n4, Promise.resolve(n4);
          }, delete: function(e4) {
            return delete t4[JSON.stringify(e4)], Promise.resolve();
          }, clear: function() {
            return t4 = {}, Promise.resolve();
          } };
        }
        function c2(e3) {
          for (var t4 = e3.length - 1; t4 > 0; t4--) {
            var r3 = Math.floor(Math.random() * (t4 + 1)), n4 = e3[t4];
            e3[t4] = e3[r3], e3[r3] = n4;
          }
          return e3;
        }
        function l2(e3, t4) {
          return t4 ? (Object.keys(t4).forEach(function(r3) {
            e3[r3] = t4[r3](e3);
          }), e3) : e3;
        }
        function f2(e3) {
          for (var t4 = arguments.length, r3 = new Array(t4 > 1 ? t4 - 1 : 0), n4 = 1; n4 < t4; n4++) r3[n4 - 1] = arguments[n4];
          var o3 = 0;
          return e3.replace(/%s/g, function() {
            return encodeURIComponent(r3[o3++]);
          });
        }
        var h2 = { WithinQueryParameters: 0, WithinHeaders: 1 };
        function m3(e3, t4) {
          var r3 = e3 || {}, n4 = r3.data || {};
          return Object.keys(r3).forEach(function(e4) {
            -1 === ["timeout", "headers", "queryParameters", "data", "cacheable"].indexOf(e4) && (n4[e4] = r3[e4]);
          }), { data: Object.entries(n4).length > 0 ? n4 : void 0, timeout: r3.timeout || t4, headers: r3.headers || {}, queryParameters: r3.queryParameters || {}, cacheable: r3.cacheable };
        }
        var d2 = { Read: 1, Write: 2, Any: 3 }, p2 = 1, v2 = 2, g2 = 3;
        function y2(e3) {
          var t4 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : p2;
          return r2(r2({}, e3), {}, { status: t4, lastUpdate: Date.now() });
        }
        function b2(e3) {
          return "string" == typeof e3 ? { protocol: "https", url: e3, accept: d2.Any } : { protocol: e3.protocol || "https", url: e3.url, accept: e3.accept || d2.Any };
        }
        var O2 = "GET", P2 = "POST";
        function q(e3, t4) {
          return Promise.all(t4.map(function(t5) {
            return e3.get(t5, function() {
              return Promise.resolve(y2(t5));
            });
          })).then(function(e4) {
            var r3 = e4.filter(function(e5) {
              return function(e6) {
                return e6.status === p2 || Date.now() - e6.lastUpdate > 12e4;
              }(e5);
            }), n4 = e4.filter(function(e5) {
              return function(e6) {
                return e6.status === g2 && Date.now() - e6.lastUpdate <= 12e4;
              }(e5);
            }), o3 = [].concat(a2(r3), a2(n4));
            return { getTimeout: function(e5, t5) {
              return (0 === n4.length && 0 === e5 ? 1 : n4.length + 3 + e5) * t5;
            }, statelessHosts: o3.length > 0 ? o3.map(function(e5) {
              return b2(e5);
            }) : t4 };
          });
        }
        function j2(e3, t4, n4, o3) {
          var u3 = [], i3 = function(e4, t5) {
            if (e4.method === O2 || void 0 === e4.data && void 0 === t5.data) return;
            var n5 = Array.isArray(e4.data) ? e4.data : r2(r2({}, e4.data), t5.data);
            return JSON.stringify(n5);
          }(n4, o3), s3 = function(e4, t5) {
            var n5 = r2(r2({}, e4.headers), t5.headers), o4 = {};
            return Object.keys(n5).forEach(function(e5) {
              var t6 = n5[e5];
              o4[e5.toLowerCase()] = t6;
            }), o4;
          }(e3, o3), c3 = n4.method, l3 = n4.method !== O2 ? {} : r2(r2({}, n4.data), o3.data), f3 = r2(r2(r2({ "x-algolia-agent": e3.userAgent.value }, e3.queryParameters), l3), o3.queryParameters), h3 = 0, m4 = function t5(r3, a3) {
            var l4 = r3.pop();
            if (void 0 === l4) throw { name: "RetryError", message: "Unreachable hosts - your application id may be incorrect. If the error persists, contact support@algolia.com.", transporterStackTrace: A2(u3) };
            var m5 = { data: i3, headers: s3, method: c3, url: S(l4, n4.path, f3), connectTimeout: a3(h3, e3.timeouts.connect), responseTimeout: a3(h3, o3.timeout) }, d3 = function(e4) {
              var t6 = { request: m5, response: e4, host: l4, triesLeft: r3.length };
              return u3.push(t6), t6;
            }, p3 = { onSuccess: function(e4) {
              return function(e5) {
                try {
                  return JSON.parse(e5.content);
                } catch (t6) {
                  throw /* @__PURE__ */ function(e6, t7) {
                    return { name: "DeserializationError", message: e6, response: t7 };
                  }(t6.message, e5);
                }
              }(e4);
            }, onRetry: function(n5) {
              var o4 = d3(n5);
              return n5.isTimedOut && h3++, Promise.all([e3.logger.info("Retryable failure", x(o4)), e3.hostsCache.set(l4, y2(l4, n5.isTimedOut ? g2 : v2))]).then(function() {
                return t5(r3, a3);
              });
            }, onFail: function(e4) {
              throw d3(e4), function(e5, t6) {
                var r4 = e5.content, n5 = e5.status, o4 = r4;
                try {
                  o4 = JSON.parse(r4).message;
                } catch (e6) {
                }
                return /* @__PURE__ */ function(e6, t7, r5) {
                  return { name: "ApiError", message: e6, status: t7, transporterStackTrace: r5 };
                }(o4, n5, t6);
              }(e4, A2(u3));
            } };
            return e3.requester.send(m5).then(function(e4) {
              return function(e5, t6) {
                return function(e6) {
                  var t7 = e6.status;
                  return e6.isTimedOut || function(e7) {
                    var t8 = e7.isTimedOut, r4 = e7.status;
                    return !t8 && 0 == ~~r4;
                  }(e6) || 2 != ~~(t7 / 100) && 4 != ~~(t7 / 100);
                }(e5) ? t6.onRetry(e5) : 2 == ~~(e5.status / 100) ? t6.onSuccess(e5) : t6.onFail(e5);
              }(e4, p3);
            });
          };
          return q(e3.hostsCache, t4).then(function(e4) {
            return m4(a2(e4.statelessHosts).reverse(), e4.getTimeout);
          });
        }
        function w2(e3) {
          var t4 = { value: "Algolia for JavaScript (".concat(e3, ")"), add: function(e4) {
            var r3 = "; ".concat(e4.segment).concat(void 0 !== e4.version ? " (".concat(e4.version, ")") : "");
            return -1 === t4.value.indexOf(r3) && (t4.value = "".concat(t4.value).concat(r3)), t4;
          } };
          return t4;
        }
        function S(e3, t4, r3) {
          var n4 = T2(r3), o3 = "".concat(e3.protocol, "://").concat(e3.url, "/").concat("/" === t4.charAt(0) ? t4.substr(1) : t4);
          return n4.length && (o3 += "?".concat(n4)), o3;
        }
        function T2(e3) {
          return Object.keys(e3).map(function(t4) {
            return f2("%s=%s", t4, (r3 = e3[t4], "[object Object]" === Object.prototype.toString.call(r3) || "[object Array]" === Object.prototype.toString.call(r3) ? JSON.stringify(e3[t4]) : e3[t4]));
            var r3;
          }).join("&");
        }
        function A2(e3) {
          return e3.map(function(e4) {
            return x(e4);
          });
        }
        function x(e3) {
          var t4 = e3.request.headers["x-algolia-api-key"] ? { "x-algolia-api-key": "*****" } : {};
          return r2(r2({}, e3), {}, { request: r2(r2({}, e3.request), {}, { headers: r2(r2({}, e3.request.headers), t4) }) });
        }
        var N2 = function(e3) {
          var t4 = e3.appId, n4 = /* @__PURE__ */ function(e4, t5, r3) {
            var n5 = { "x-algolia-api-key": r3, "x-algolia-application-id": t5 };
            return { headers: function() {
              return e4 === h2.WithinHeaders ? n5 : {};
            }, queryParameters: function() {
              return e4 === h2.WithinQueryParameters ? n5 : {};
            } };
          }(void 0 !== e3.authMode ? e3.authMode : h2.WithinHeaders, t4, e3.apiKey), a3 = function(e4) {
            var t5 = e4.hostsCache, r3 = e4.logger, n5 = e4.requester, a4 = e4.requestsCache, u3 = e4.responsesCache, i3 = e4.timeouts, s3 = e4.userAgent, c3 = e4.hosts, l3 = e4.queryParameters, f3 = { hostsCache: t5, logger: r3, requester: n5, requestsCache: a4, responsesCache: u3, timeouts: i3, userAgent: s3, headers: e4.headers, queryParameters: l3, hosts: c3.map(function(e5) {
              return b2(e5);
            }), read: function(e5, t6) {
              var r4 = m3(t6, f3.timeouts.read), n6 = function() {
                return j2(f3, f3.hosts.filter(function(e6) {
                  return 0 != (e6.accept & d2.Read);
                }), e5, r4);
              };
              if (true !== (void 0 !== r4.cacheable ? r4.cacheable : e5.cacheable)) return n6();
              var a5 = { request: e5, mappedRequestOptions: r4, transporter: { queryParameters: f3.queryParameters, headers: f3.headers } };
              return f3.responsesCache.get(a5, function() {
                return f3.requestsCache.get(a5, function() {
                  return f3.requestsCache.set(a5, n6()).then(function(e6) {
                    return Promise.all([f3.requestsCache.delete(a5), e6]);
                  }, function(e6) {
                    return Promise.all([f3.requestsCache.delete(a5), Promise.reject(e6)]);
                  }).then(function(e6) {
                    var t7 = o2(e6, 2);
                    t7[0];
                    return t7[1];
                  });
                });
              }, { miss: function(e6) {
                return f3.responsesCache.set(a5, e6);
              } });
            }, write: function(e5, t6) {
              return j2(f3, f3.hosts.filter(function(e6) {
                return 0 != (e6.accept & d2.Write);
              }), e5, m3(t6, f3.timeouts.write));
            } };
            return f3;
          }(r2(r2({ hosts: [{ url: "".concat(t4, "-dsn.algolia.net"), accept: d2.Read }, { url: "".concat(t4, ".algolia.net"), accept: d2.Write }].concat(c2([{ url: "".concat(t4, "-1.algolianet.com") }, { url: "".concat(t4, "-2.algolianet.com") }, { url: "".concat(t4, "-3.algolianet.com") }])) }, e3), {}, { headers: r2(r2(r2({}, n4.headers()), { "content-type": "application/x-www-form-urlencoded" }), e3.headers), queryParameters: r2(r2({}, n4.queryParameters()), e3.queryParameters) }));
          return l2({ transporter: a3, appId: t4, addAlgoliaAgent: function(e4, t5) {
            a3.userAgent.add({ segment: e4, version: t5 });
          }, clearCache: function() {
            return Promise.all([a3.requestsCache.clear(), a3.responsesCache.clear()]).then(function() {
            });
          } }, e3.methods);
        }, C2 = function(e3) {
          return function(t4, r3) {
            return t4.method === O2 ? e3.transporter.read(t4, r3) : e3.transporter.write(t4, r3);
          };
        }, E = function(e3) {
          return function(t4) {
            var r3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, n4 = { transporter: e3.transporter, appId: e3.appId, indexName: t4 };
            return l2(n4, r3.methods);
          };
        }, J = function(e3) {
          return function(t4, n4) {
            var o3 = t4.map(function(e4) {
              return r2(r2({}, e4), {}, { params: T2(e4.params || {}) });
            });
            return e3.transporter.read({ method: P2, path: "1/indexes/*/queries", data: { requests: o3 }, cacheable: true }, n4);
          };
        }, k2 = function(e3) {
          return function(t4, o3) {
            return Promise.all(t4.map(function(t5) {
              var a3 = t5.params, u3 = a3.facetName, i3 = a3.facetQuery, s3 = n3(a3, ["facetName", "facetQuery"]);
              return E(e3)(t5.indexName, { methods: { searchForFacetValues: F } }).searchForFacetValues(u3, i3, r2(r2({}, o3), s3));
            }));
          };
        }, I2 = function(e3) {
          return function(t4, r3, n4) {
            return e3.transporter.read({ method: P2, path: f2("1/answers/%s/prediction", e3.indexName), data: { query: t4, queryLanguages: r3 }, cacheable: true }, n4);
          };
        }, R = function(e3) {
          return function(t4, r3) {
            return e3.transporter.read({ method: P2, path: f2("1/indexes/%s/query", e3.indexName), data: { query: t4 }, cacheable: true }, r3);
          };
        }, F = function(e3) {
          return function(t4, r3, n4) {
            return e3.transporter.read({ method: P2, path: f2("1/indexes/%s/facets/%s/query", e3.indexName, t4), data: { facetQuery: r3 }, cacheable: true }, n4);
          };
        }, D = 1, W = 2, H2 = 3;
        var Q = function(e3) {
          return function(t4, n4) {
            var o3 = t4.map(function(e4) {
              return r2(r2({}, e4), {}, { threshold: e4.threshold || 0 });
            });
            return e3.transporter.read({ method: P2, path: "1/indexes/*/recommendations", data: { requests: o3 }, cacheable: true }, n4);
          };
        };
        function L2(e3, t4, n4) {
          var o3, a3 = { appId: e3, apiKey: t4, timeouts: { connect: 1, read: 2, write: 30 }, requester: { send: function(e4) {
            return new Promise(function(t5) {
              var r3 = new XMLHttpRequest();
              r3.open(e4.method, e4.url, true), Object.keys(e4.headers).forEach(function(t6) {
                return r3.setRequestHeader(t6, e4.headers[t6]);
              });
              var n5, o4 = function(e5, n6) {
                return setTimeout(function() {
                  r3.abort(), t5({ status: 0, content: n6, isTimedOut: true });
                }, 1e3 * e5);
              }, a4 = o4(e4.connectTimeout, "Connection timeout");
              r3.onreadystatechange = function() {
                r3.readyState > r3.OPENED && void 0 === n5 && (clearTimeout(a4), n5 = o4(e4.responseTimeout, "Socket timeout"));
              }, r3.onerror = function() {
                0 === r3.status && (clearTimeout(a4), clearTimeout(n5), t5({ content: r3.responseText || "Network request failed", status: r3.status, isTimedOut: false }));
              }, r3.onload = function() {
                clearTimeout(a4), clearTimeout(n5), t5({ content: r3.responseText, status: r3.status, isTimedOut: false });
              }, r3.send(e4.data);
            });
          } }, logger: (o3 = H2, { debug: function(e4, t5) {
            return D >= o3 && console.debug(e4, t5), Promise.resolve();
          }, info: function(e4, t5) {
            return W >= o3 && console.info(e4, t5), Promise.resolve();
          }, error: function(e4, t5) {
            return console.error(e4, t5), Promise.resolve();
          } }), responsesCache: s2(), requestsCache: s2({ serializable: false }), hostsCache: i2({ caches: [u2({ key: "".concat("4.23.2", "-").concat(e3) }), s2()] }), userAgent: w2("4.23.2").add({ segment: "Browser", version: "lite" }), authMode: h2.WithinQueryParameters };
          return N2(r2(r2(r2({}, a3), n4), {}, { methods: { search: J, searchForFacetValues: k2, multipleQueries: J, multipleSearchForFacetValues: k2, customRequest: C2, initIndex: function(e4) {
            return function(t5) {
              return E(e4)(t5, { methods: { search: R, searchForFacetValues: F, findAnswers: I2 } });
            };
          }, getRecommendations: Q } }));
        }
        return L2.version = "4.23.2", L2;
      });
    }
  });

  // ../../node_modules/@algolia/events/events.js
  var require_events = __commonJS({
    "../../node_modules/@algolia/events/events.js"(exports, module) {
      function EventEmitter2() {
        this._events = this._events || {};
        this._maxListeners = this._maxListeners || void 0;
      }
      module.exports = EventEmitter2;
      EventEmitter2.prototype._events = void 0;
      EventEmitter2.prototype._maxListeners = void 0;
      EventEmitter2.defaultMaxListeners = 10;
      EventEmitter2.prototype.setMaxListeners = function(n3) {
        if (!isNumber(n3) || n3 < 0 || isNaN(n3))
          throw TypeError("n must be a positive number");
        this._maxListeners = n3;
        return this;
      };
      EventEmitter2.prototype.emit = function(type) {
        var er, handler, len, args, i2, listeners;
        if (!this._events)
          this._events = {};
        if (type === "error") {
          if (!this._events.error || isObject(this._events.error) && !this._events.error.length) {
            er = arguments[1];
            if (er instanceof Error) {
              throw er;
            } else {
              var err = new Error('Uncaught, unspecified "error" event. (' + er + ")");
              err.context = er;
              throw err;
            }
          }
        }
        handler = this._events[type];
        if (isUndefined(handler))
          return false;
        if (isFunction(handler)) {
          switch (arguments.length) {
            case 1:
              handler.call(this);
              break;
            case 2:
              handler.call(this, arguments[1]);
              break;
            case 3:
              handler.call(this, arguments[1], arguments[2]);
              break;
            default:
              args = Array.prototype.slice.call(arguments, 1);
              handler.apply(this, args);
          }
        } else if (isObject(handler)) {
          args = Array.prototype.slice.call(arguments, 1);
          listeners = handler.slice();
          len = listeners.length;
          for (i2 = 0; i2 < len; i2++)
            listeners[i2].apply(this, args);
        }
        return true;
      };
      EventEmitter2.prototype.addListener = function(type, listener) {
        var m3;
        if (!isFunction(listener))
          throw TypeError("listener must be a function");
        if (!this._events)
          this._events = {};
        if (this._events.newListener)
          this.emit(
            "newListener",
            type,
            isFunction(listener.listener) ? listener.listener : listener
          );
        if (!this._events[type])
          this._events[type] = listener;
        else if (isObject(this._events[type]))
          this._events[type].push(listener);
        else
          this._events[type] = [this._events[type], listener];
        if (isObject(this._events[type]) && !this._events[type].warned) {
          if (!isUndefined(this._maxListeners)) {
            m3 = this._maxListeners;
          } else {
            m3 = EventEmitter2.defaultMaxListeners;
          }
          if (m3 && m3 > 0 && this._events[type].length > m3) {
            this._events[type].warned = true;
            console.error(
              "(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",
              this._events[type].length
            );
            if (typeof console.trace === "function") {
              console.trace();
            }
          }
        }
        return this;
      };
      EventEmitter2.prototype.on = EventEmitter2.prototype.addListener;
      EventEmitter2.prototype.once = function(type, listener) {
        if (!isFunction(listener))
          throw TypeError("listener must be a function");
        var fired = false;
        function g2() {
          this.removeListener(type, g2);
          if (!fired) {
            fired = true;
            listener.apply(this, arguments);
          }
        }
        g2.listener = listener;
        this.on(type, g2);
        return this;
      };
      EventEmitter2.prototype.removeListener = function(type, listener) {
        var list, position, length, i2;
        if (!isFunction(listener))
          throw TypeError("listener must be a function");
        if (!this._events || !this._events[type])
          return this;
        list = this._events[type];
        length = list.length;
        position = -1;
        if (list === listener || isFunction(list.listener) && list.listener === listener) {
          delete this._events[type];
          if (this._events.removeListener)
            this.emit("removeListener", type, listener);
        } else if (isObject(list)) {
          for (i2 = length; i2-- > 0; ) {
            if (list[i2] === listener || list[i2].listener && list[i2].listener === listener) {
              position = i2;
              break;
            }
          }
          if (position < 0)
            return this;
          if (list.length === 1) {
            list.length = 0;
            delete this._events[type];
          } else {
            list.splice(position, 1);
          }
          if (this._events.removeListener)
            this.emit("removeListener", type, listener);
        }
        return this;
      };
      EventEmitter2.prototype.removeAllListeners = function(type) {
        var key2, listeners;
        if (!this._events)
          return this;
        if (!this._events.removeListener) {
          if (arguments.length === 0)
            this._events = {};
          else if (this._events[type])
            delete this._events[type];
          return this;
        }
        if (arguments.length === 0) {
          for (key2 in this._events) {
            if (key2 === "removeListener") continue;
            this.removeAllListeners(key2);
          }
          this.removeAllListeners("removeListener");
          this._events = {};
          return this;
        }
        listeners = this._events[type];
        if (isFunction(listeners)) {
          this.removeListener(type, listeners);
        } else if (listeners) {
          while (listeners.length)
            this.removeListener(type, listeners[listeners.length - 1]);
        }
        delete this._events[type];
        return this;
      };
      EventEmitter2.prototype.listeners = function(type) {
        var ret;
        if (!this._events || !this._events[type])
          ret = [];
        else if (isFunction(this._events[type]))
          ret = [this._events[type]];
        else
          ret = this._events[type].slice();
        return ret;
      };
      EventEmitter2.prototype.listenerCount = function(type) {
        if (this._events) {
          var evlistener = this._events[type];
          if (isFunction(evlistener))
            return 1;
          else if (evlistener)
            return evlistener.length;
        }
        return 0;
      };
      EventEmitter2.listenerCount = function(emitter, type) {
        return emitter.listenerCount(type);
      };
      function isFunction(arg) {
        return typeof arg === "function";
      }
      function isNumber(arg) {
        return typeof arg === "number";
      }
      function isObject(arg) {
        return typeof arg === "object" && arg !== null;
      }
      function isUndefined(arg) {
        return arg === void 0;
      }
    }
  });

  // node_modules/algoliasearch-helper/src/functions/inherits.js
  var require_inherits = __commonJS({
    "node_modules/algoliasearch-helper/src/functions/inherits.js"(exports, module) {
      "use strict";
      function inherits(ctor, superCtor) {
        ctor.prototype = Object.create(superCtor.prototype, {
          constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
          }
        });
      }
      module.exports = inherits;
    }
  });

  // node_modules/algoliasearch-helper/src/DerivedHelper/index.js
  var require_DerivedHelper = __commonJS({
    "node_modules/algoliasearch-helper/src/DerivedHelper/index.js"(exports, module) {
      "use strict";
      var EventEmitter2 = require_events();
      var inherits = require_inherits();
      function DerivedHelper(mainHelper, fn, recommendFn) {
        this.main = mainHelper;
        this.fn = fn;
        this.recommendFn = recommendFn;
        this.lastResults = null;
        this.lastRecommendResults = null;
      }
      inherits(DerivedHelper, EventEmitter2);
      DerivedHelper.prototype.detach = function() {
        this.removeAllListeners();
        this.main.detachDerivedHelper(this);
      };
      DerivedHelper.prototype.getModifiedState = function(parameters) {
        return this.fn(parameters);
      };
      DerivedHelper.prototype.getModifiedRecommendState = function(parameters) {
        return this.recommendFn(parameters);
      };
      module.exports = DerivedHelper;
    }
  });

  // node_modules/algoliasearch-helper/src/functions/escapeFacetValue.js
  var require_escapeFacetValue = __commonJS({
    "node_modules/algoliasearch-helper/src/functions/escapeFacetValue.js"(exports, module) {
      "use strict";
      function escapeFacetValue(value) {
        if (typeof value !== "string") return value;
        return String(value).replace(/^-/, "\\-");
      }
      function unescapeFacetValue(value) {
        if (typeof value !== "string") return value;
        return value.replace(/^\\-/, "-");
      }
      module.exports = {
        escapeFacetValue,
        unescapeFacetValue
      };
    }
  });

  // node_modules/algoliasearch-helper/src/functions/merge.js
  var require_merge = __commonJS({
    "node_modules/algoliasearch-helper/src/functions/merge.js"(exports, module) {
      "use strict";
      function clone(value) {
        if (typeof value === "object" && value !== null) {
          return _merge(Array.isArray(value) ? [] : {}, value);
        }
        return value;
      }
      function isObjectOrArrayOrFunction(value) {
        return typeof value === "function" || Array.isArray(value) || Object.prototype.toString.call(value) === "[object Object]";
      }
      function _merge(target, source) {
        if (target === source) {
          return target;
        }
        for (var key2 in source) {
          if (!Object.prototype.hasOwnProperty.call(source, key2) || key2 === "__proto__" || key2 === "constructor") {
            continue;
          }
          var sourceVal = source[key2];
          var targetVal = target[key2];
          if (typeof targetVal !== "undefined" && typeof sourceVal === "undefined") {
            continue;
          }
          if (isObjectOrArrayOrFunction(targetVal) && isObjectOrArrayOrFunction(sourceVal)) {
            target[key2] = _merge(targetVal, sourceVal);
          } else {
            target[key2] = clone(sourceVal);
          }
        }
        return target;
      }
      function merge(target) {
        if (!isObjectOrArrayOrFunction(target)) {
          target = {};
        }
        for (var i2 = 1, l2 = arguments.length; i2 < l2; i2++) {
          var source = arguments[i2];
          if (isObjectOrArrayOrFunction(source)) {
            _merge(target, source);
          }
        }
        return target;
      }
      module.exports = merge;
    }
  });

  // node_modules/algoliasearch-helper/src/functions/objectHasKeys.js
  var require_objectHasKeys = __commonJS({
    "node_modules/algoliasearch-helper/src/functions/objectHasKeys.js"(exports, module) {
      "use strict";
      function objectHasKeys(obj) {
        return obj && Object.keys(obj).length > 0;
      }
      module.exports = objectHasKeys;
    }
  });

  // node_modules/algoliasearch-helper/src/functions/omit.js
  var require_omit = __commonJS({
    "node_modules/algoliasearch-helper/src/functions/omit.js"(exports, module) {
      "use strict";
      function _objectWithoutPropertiesLoose16(source, excluded) {
        if (source === null) return {};
        var target = {};
        var sourceKeys = Object.keys(source);
        var key2;
        var i2;
        for (i2 = 0; i2 < sourceKeys.length; i2++) {
          key2 = sourceKeys[i2];
          if (excluded.indexOf(key2) >= 0) continue;
          target[key2] = source[key2];
        }
        return target;
      }
      module.exports = _objectWithoutPropertiesLoose16;
    }
  });

  // node_modules/algoliasearch-helper/src/RecommendParameters/index.js
  var require_RecommendParameters = __commonJS({
    "node_modules/algoliasearch-helper/src/RecommendParameters/index.js"(exports, module) {
      "use strict";
      function RecommendParameters(opts) {
        opts = opts || {};
        this.params = opts.params || [];
      }
      RecommendParameters.prototype = {
        constructor: RecommendParameters,
        addParams: function(params) {
          var newParams = this.params.slice();
          newParams.push(params);
          return new RecommendParameters({ params: newParams });
        },
        removeParams: function(id2) {
          return new RecommendParameters({
            params: this.params.filter(function(param) {
              return param.$$id !== id2;
            })
          });
        },
        addFrequentlyBoughtTogether: function(params) {
          return this.addParams(
            Object.assign({}, params, { model: "bought-together" })
          );
        },
        addRelatedProducts: function(params) {
          return this.addParams(
            Object.assign({}, params, { model: "related-products" })
          );
        },
        addTrendingItems: function(params) {
          return this.addParams(
            Object.assign({}, params, { model: "trending-items" })
          );
        },
        addTrendingFacets: function(params) {
          return this.addParams(
            Object.assign({}, params, { model: "trending-facets" })
          );
        },
        addLookingSimilar: function(params) {
          return this.addParams(
            Object.assign({}, params, { model: "looking-similar" })
          );
        },
        _buildQueries: function(indexName, cache) {
          return this.params.filter(function(params) {
            return cache[params.$$id] === void 0;
          }).map(function(params) {
            var query = Object.assign({}, params, { indexName });
            delete query.$$id;
            return query;
          });
        }
      };
      module.exports = RecommendParameters;
    }
  });

  // node_modules/algoliasearch-helper/src/RecommendResults/index.js
  var require_RecommendResults = __commonJS({
    "node_modules/algoliasearch-helper/src/RecommendResults/index.js"(exports, module) {
      "use strict";
      function RecommendResults(state, results) {
        this._state = state;
        this._rawResults = {};
        var self2 = this;
        state.params.forEach(function(param) {
          var id2 = param.$$id;
          self2[id2] = results[id2];
          self2._rawResults[id2] = results[id2];
        });
      }
      RecommendResults.prototype = {
        constructor: RecommendResults
      };
      module.exports = RecommendResults;
    }
  });

  // node_modules/algoliasearch-helper/src/requestBuilder.js
  var require_requestBuilder = __commonJS({
    "node_modules/algoliasearch-helper/src/requestBuilder.js"(exports, module) {
      "use strict";
      var merge = require_merge();
      function sortObject(obj) {
        return Object.keys(obj).sort().reduce(function(acc, curr) {
          acc[curr] = obj[curr];
          return acc;
        }, {});
      }
      var requestBuilder = {
        /**
         * Get all the queries to send to the client, those queries can used directly
         * with the Algolia client.
         * @private
         * @param  {string} index The name of the index
         * @param  {SearchParameters} state The state from which to get the queries
         * @return {object[]} The queries
         */
        _getQueries: function getQueries(index3, state) {
          var queries = [];
          queries.push({
            indexName: index3,
            params: requestBuilder._getHitsSearchParams(state)
          });
          state.getRefinedDisjunctiveFacets().forEach(function(refinedFacet) {
            queries.push({
              indexName: index3,
              params: requestBuilder._getDisjunctiveFacetSearchParams(
                state,
                refinedFacet
              )
            });
          });
          state.getRefinedHierarchicalFacets().forEach(function(refinedFacet) {
            var hierarchicalFacet = state.getHierarchicalFacetByName(refinedFacet);
            var currentRefinement = state.getHierarchicalRefinement(refinedFacet);
            var separator = state._getHierarchicalFacetSeparator(hierarchicalFacet);
            if (currentRefinement.length > 0 && currentRefinement[0].split(separator).length > 1) {
              var filtersMap = currentRefinement[0].split(separator).slice(0, -1).reduce(function createFiltersMap(map, segment, level) {
                return map.concat({
                  attribute: hierarchicalFacet.attributes[level],
                  value: level === 0 ? segment : [map[map.length - 1].value, segment].join(separator)
                });
              }, []);
              filtersMap.forEach(function(filter, level) {
                var params = requestBuilder._getDisjunctiveFacetSearchParams(
                  state,
                  filter.attribute,
                  level === 0
                );
                function hasHierarchicalFacetFilter(value) {
                  return hierarchicalFacet.attributes.some(function(attribute) {
                    return attribute === value.split(":")[0];
                  });
                }
                var filteredFacetFilters = (params.facetFilters || []).reduce(
                  function(acc, facetFilter) {
                    if (Array.isArray(facetFilter)) {
                      var filtered = facetFilter.filter(function(filterValue) {
                        return !hasHierarchicalFacetFilter(filterValue);
                      });
                      if (filtered.length > 0) {
                        acc.push(filtered);
                      }
                    }
                    if (typeof facetFilter === "string" && !hasHierarchicalFacetFilter(facetFilter)) {
                      acc.push(facetFilter);
                    }
                    return acc;
                  },
                  []
                );
                var parent = filtersMap[level - 1];
                if (level > 0) {
                  params.facetFilters = filteredFacetFilters.concat(
                    parent.attribute + ":" + parent.value
                  );
                } else {
                  params.facetFilters = filteredFacetFilters.length > 0 ? filteredFacetFilters : void 0;
                }
                queries.push({ indexName: index3, params });
              });
            }
          });
          return queries;
        },
        /**
         * Build search parameters used to fetch hits
         * @private
         * @param  {SearchParameters} state The state from which to get the queries
         * @return {object.<string, any>} The search parameters for hits
         */
        _getHitsSearchParams: function(state) {
          var facets = state.facets.concat(state.disjunctiveFacets).concat(requestBuilder._getHitsHierarchicalFacetsAttributes(state)).sort();
          var facetFilters = requestBuilder._getFacetFilters(state);
          var numericFilters = requestBuilder._getNumericFilters(state);
          var tagFilters = requestBuilder._getTagFilters(state);
          var additionalParams = {
            facets: facets.indexOf("*") > -1 ? ["*"] : facets,
            tagFilters
          };
          if (facetFilters.length > 0) {
            additionalParams.facetFilters = facetFilters;
          }
          if (numericFilters.length > 0) {
            additionalParams.numericFilters = numericFilters;
          }
          return sortObject(merge({}, state.getQueryParams(), additionalParams));
        },
        /**
         * Build search parameters used to fetch a disjunctive facet
         * @private
         * @param  {SearchParameters} state The state from which to get the queries
         * @param  {string} facet the associated facet name
         * @param  {boolean} hierarchicalRootLevel ?? FIXME
         * @return {object} The search parameters for a disjunctive facet
         */
        _getDisjunctiveFacetSearchParams: function(state, facet, hierarchicalRootLevel) {
          var facetFilters = requestBuilder._getFacetFilters(
            state,
            facet,
            hierarchicalRootLevel
          );
          var numericFilters = requestBuilder._getNumericFilters(state, facet);
          var tagFilters = requestBuilder._getTagFilters(state);
          var additionalParams = {
            hitsPerPage: 0,
            page: 0,
            analytics: false,
            clickAnalytics: false
          };
          if (tagFilters.length > 0) {
            additionalParams.tagFilters = tagFilters;
          }
          var hierarchicalFacet = state.getHierarchicalFacetByName(facet);
          if (hierarchicalFacet) {
            additionalParams.facets = requestBuilder._getDisjunctiveHierarchicalFacetAttribute(
              state,
              hierarchicalFacet,
              hierarchicalRootLevel
            );
          } else {
            additionalParams.facets = facet;
          }
          if (numericFilters.length > 0) {
            additionalParams.numericFilters = numericFilters;
          }
          if (facetFilters.length > 0) {
            additionalParams.facetFilters = facetFilters;
          }
          return sortObject(merge({}, state.getQueryParams(), additionalParams));
        },
        /**
         * Return the numeric filters in an algolia request fashion
         * @private
         * @param {SearchParameters} state the state from which to get the filters
         * @param {string} [facetName] the name of the attribute for which the filters should be excluded
         * @return {string[]} the numeric filters in the algolia format
         */
        _getNumericFilters: function(state, facetName) {
          if (state.numericFilters) {
            return state.numericFilters;
          }
          var numericFilters = [];
          Object.keys(state.numericRefinements).forEach(function(attribute) {
            var operators = state.numericRefinements[attribute] || {};
            Object.keys(operators).forEach(function(operator) {
              var values = operators[operator] || [];
              if (facetName !== attribute) {
                values.forEach(function(value) {
                  if (Array.isArray(value)) {
                    var vs = value.map(function(v2) {
                      return attribute + operator + v2;
                    });
                    numericFilters.push(vs);
                  } else {
                    numericFilters.push(attribute + operator + value);
                  }
                });
              }
            });
          });
          return numericFilters;
        },
        /**
         * Return the tags filters depending on which format is used, either tagFilters or tagRefinements
         * @private
         * @param {SearchParameters} state the state from which to get the filters
         * @return {string} Tag filters in a single string
         */
        _getTagFilters: function(state) {
          if (state.tagFilters) {
            return state.tagFilters;
          }
          return state.tagRefinements.join(",");
        },
        /**
         * Build facetFilters parameter based on current refinements. The array returned
         * contains strings representing the facet filters in the algolia format.
         * @private
         * @param  {SearchParameters} state The state from which to get the queries
         * @param  {string} [facet] if set, the current disjunctive facet
         * @param  {boolean} [hierarchicalRootLevel] ?? FIXME
         * @return {array.<string>} The facet filters in the algolia format
         */
        _getFacetFilters: function(state, facet, hierarchicalRootLevel) {
          var facetFilters = [];
          var facetsRefinements = state.facetsRefinements || {};
          Object.keys(facetsRefinements).sort().forEach(function(facetName) {
            var facetValues = facetsRefinements[facetName] || [];
            facetValues.slice().sort().forEach(function(facetValue) {
              facetFilters.push(facetName + ":" + facetValue);
            });
          });
          var facetsExcludes = state.facetsExcludes || {};
          Object.keys(facetsExcludes).sort().forEach(function(facetName) {
            var facetValues = facetsExcludes[facetName] || [];
            facetValues.sort().forEach(function(facetValue) {
              facetFilters.push(facetName + ":-" + facetValue);
            });
          });
          var disjunctiveFacetsRefinements = state.disjunctiveFacetsRefinements || {};
          Object.keys(disjunctiveFacetsRefinements).sort().forEach(function(facetName) {
            var facetValues = disjunctiveFacetsRefinements[facetName] || [];
            if (facetName === facet || !facetValues || facetValues.length === 0) {
              return;
            }
            var orFilters = [];
            facetValues.slice().sort().forEach(function(facetValue) {
              orFilters.push(facetName + ":" + facetValue);
            });
            facetFilters.push(orFilters);
          });
          var hierarchicalFacetsRefinements = state.hierarchicalFacetsRefinements || {};
          Object.keys(hierarchicalFacetsRefinements).sort().forEach(function(facetName) {
            var facetValues = hierarchicalFacetsRefinements[facetName] || [];
            var facetValue = facetValues[0];
            if (facetValue === void 0) {
              return;
            }
            var hierarchicalFacet = state.getHierarchicalFacetByName(facetName);
            var separator = state._getHierarchicalFacetSeparator(hierarchicalFacet);
            var rootPath = state._getHierarchicalRootPath(hierarchicalFacet);
            var attributeToRefine;
            var attributesIndex;
            if (facet === facetName) {
              if (facetValue.indexOf(separator) === -1 || !rootPath && hierarchicalRootLevel === true || rootPath && rootPath.split(separator).length === facetValue.split(separator).length) {
                return;
              }
              if (!rootPath) {
                attributesIndex = facetValue.split(separator).length - 2;
                facetValue = facetValue.slice(0, facetValue.lastIndexOf(separator));
              } else {
                attributesIndex = rootPath.split(separator).length - 1;
                facetValue = rootPath;
              }
              attributeToRefine = hierarchicalFacet.attributes[attributesIndex];
            } else {
              attributesIndex = facetValue.split(separator).length - 1;
              attributeToRefine = hierarchicalFacet.attributes[attributesIndex];
            }
            if (attributeToRefine) {
              facetFilters.push([attributeToRefine + ":" + facetValue]);
            }
          });
          return facetFilters;
        },
        _getHitsHierarchicalFacetsAttributes: function(state) {
          var out = [];
          return state.hierarchicalFacets.reduce(
            // ask for as much levels as there's hierarchical refinements
            function getHitsAttributesForHierarchicalFacet(allAttributes, hierarchicalFacet) {
              var hierarchicalRefinement = state.getHierarchicalRefinement(
                hierarchicalFacet.name
              )[0];
              if (!hierarchicalRefinement) {
                allAttributes.push(hierarchicalFacet.attributes[0]);
                return allAttributes;
              }
              var separator = state._getHierarchicalFacetSeparator(hierarchicalFacet);
              var level = hierarchicalRefinement.split(separator).length;
              var newAttributes = hierarchicalFacet.attributes.slice(0, level + 1);
              return allAttributes.concat(newAttributes);
            },
            out
          );
        },
        _getDisjunctiveHierarchicalFacetAttribute: function(state, hierarchicalFacet, rootLevel) {
          var separator = state._getHierarchicalFacetSeparator(hierarchicalFacet);
          if (rootLevel === true) {
            var rootPath = state._getHierarchicalRootPath(hierarchicalFacet);
            var attributeIndex = 0;
            if (rootPath) {
              attributeIndex = rootPath.split(separator).length;
            }
            return [hierarchicalFacet.attributes[attributeIndex]];
          }
          var hierarchicalRefinement = state.getHierarchicalRefinement(hierarchicalFacet.name)[0] || "";
          var parentLevel = hierarchicalRefinement.split(separator).length - 1;
          return hierarchicalFacet.attributes.slice(0, parentLevel + 1);
        },
        getSearchForFacetQuery: function(facetName, query, maxFacetHits, state) {
          var stateForSearchForFacetValues = state.isDisjunctiveFacet(facetName) ? state.clearRefinements(facetName) : state;
          var searchForFacetSearchParameters = {
            facetQuery: query,
            facetName
          };
          if (typeof maxFacetHits === "number") {
            searchForFacetSearchParameters.maxFacetHits = maxFacetHits;
          }
          return sortObject(
            merge(
              {},
              requestBuilder._getHitsSearchParams(stateForSearchForFacetValues),
              searchForFacetSearchParameters
            )
          );
        }
      };
      module.exports = requestBuilder;
    }
  });

  // node_modules/algoliasearch-helper/src/functions/defaultsPure.js
  var require_defaultsPure = __commonJS({
    "node_modules/algoliasearch-helper/src/functions/defaultsPure.js"(exports, module) {
      "use strict";
      module.exports = function defaultsPure() {
        var sources = Array.prototype.slice.call(arguments);
        return sources.reduceRight(function(acc, source) {
          Object.keys(Object(source)).forEach(function(key2) {
            if (source[key2] === void 0) {
              return;
            }
            if (acc[key2] !== void 0) {
              delete acc[key2];
            }
            acc[key2] = source[key2];
          });
          return acc;
        }, {});
      };
    }
  });

  // node_modules/algoliasearch-helper/src/functions/find.js
  var require_find = __commonJS({
    "node_modules/algoliasearch-helper/src/functions/find.js"(exports, module) {
      "use strict";
      module.exports = function find2(array, comparator) {
        if (!Array.isArray(array)) {
          return void 0;
        }
        for (var i2 = 0; i2 < array.length; i2++) {
          if (comparator(array[i2])) {
            return array[i2];
          }
        }
        return void 0;
      };
    }
  });

  // node_modules/algoliasearch-helper/src/functions/intersection.js
  var require_intersection = __commonJS({
    "node_modules/algoliasearch-helper/src/functions/intersection.js"(exports, module) {
      "use strict";
      function intersection(arr1, arr2) {
        return arr1.filter(function(value, index3) {
          return arr2.indexOf(value) > -1 && arr1.indexOf(value) === index3;
        });
      }
      module.exports = intersection;
    }
  });

  // node_modules/algoliasearch-helper/src/functions/valToNumber.js
  var require_valToNumber = __commonJS({
    "node_modules/algoliasearch-helper/src/functions/valToNumber.js"(exports, module) {
      "use strict";
      function valToNumber(v2) {
        if (typeof v2 === "number") {
          return v2;
        } else if (typeof v2 === "string") {
          return parseFloat(v2);
        } else if (Array.isArray(v2)) {
          return v2.map(valToNumber);
        }
        throw new Error(
          "The value should be a number, a parsable string or an array of those."
        );
      }
      module.exports = valToNumber;
    }
  });

  // node_modules/algoliasearch-helper/src/utils/isValidUserToken.js
  var require_isValidUserToken = __commonJS({
    "node_modules/algoliasearch-helper/src/utils/isValidUserToken.js"(exports, module) {
      "use strict";
      module.exports = function isValidUserToken(userToken) {
        if (userToken === null) {
          return false;
        }
        return /^[a-zA-Z0-9_-]{1,64}$/.test(userToken);
      };
    }
  });

  // node_modules/algoliasearch-helper/src/SearchParameters/RefinementList.js
  var require_RefinementList = __commonJS({
    "node_modules/algoliasearch-helper/src/SearchParameters/RefinementList.js"(exports, module) {
      "use strict";
      var defaultsPure = require_defaultsPure();
      var objectHasKeys = require_objectHasKeys();
      var omit2 = require_omit();
      var lib = {
        /**
         * Adds a refinement to a RefinementList
         * @param {RefinementList} refinementList the initial list
         * @param {string} attribute the attribute to refine
         * @param {string} value the value of the refinement, if the value is not a string it will be converted
         * @return {RefinementList} a new and updated refinement list
         */
        addRefinement: function addRefinement(refinementList, attribute, value) {
          if (lib.isRefined(refinementList, attribute, value)) {
            return refinementList;
          }
          var valueAsString = "" + value;
          var facetRefinement = !refinementList[attribute] ? [valueAsString] : refinementList[attribute].concat(valueAsString);
          var mod = {};
          mod[attribute] = facetRefinement;
          return defaultsPure({}, mod, refinementList);
        },
        /**
         * Removes refinement(s) for an attribute:
         *  - if the value is specified removes the refinement for the value on the attribute
         *  - if no value is specified removes all the refinements for this attribute
         * @param {RefinementList} refinementList the initial list
         * @param {string} attribute the attribute to refine
         * @param {string} [value] the value of the refinement
         * @return {RefinementList} a new and updated refinement lst
         */
        removeRefinement: function removeRefinement(refinementList, attribute, value) {
          if (value === void 0) {
            return lib.clearRefinement(refinementList, function(v2, f2) {
              return attribute === f2;
            });
          }
          var valueAsString = "" + value;
          return lib.clearRefinement(refinementList, function(v2, f2) {
            return attribute === f2 && valueAsString === v2;
          });
        },
        /**
         * Toggles the refinement value for an attribute.
         * @param {RefinementList} refinementList the initial list
         * @param {string} attribute the attribute to refine
         * @param {string} value the value of the refinement
         * @return {RefinementList} a new and updated list
         */
        toggleRefinement: function toggleRefinement(refinementList, attribute, value) {
          if (value === void 0)
            throw new Error("toggleRefinement should be used with a value");
          if (lib.isRefined(refinementList, attribute, value)) {
            return lib.removeRefinement(refinementList, attribute, value);
          }
          return lib.addRefinement(refinementList, attribute, value);
        },
        /**
         * Clear all or parts of a RefinementList. Depending on the arguments, three
         * kinds of behavior can happen:
         *  - if no attribute is provided: clears the whole list
         *  - if an attribute is provided as a string: clears the list for the specific attribute
         *  - if an attribute is provided as a function: discards the elements for which the function returns true
         * @param {RefinementList} refinementList the initial list
         * @param {string} [attribute] the attribute or function to discard
         * @param {string} [refinementType] optional parameter to give more context to the attribute function
         * @return {RefinementList} a new and updated refinement list
         */
        clearRefinement: function clearRefinement(refinementList, attribute, refinementType) {
          if (attribute === void 0) {
            if (!objectHasKeys(refinementList)) {
              return refinementList;
            }
            return {};
          } else if (typeof attribute === "string") {
            return omit2(refinementList, [attribute]);
          } else if (typeof attribute === "function") {
            var hasChanged = false;
            var newRefinementList = Object.keys(refinementList).reduce(
              function(memo, key2) {
                var values = refinementList[key2] || [];
                var facetList = values.filter(function(value) {
                  return !attribute(value, key2, refinementType);
                });
                if (facetList.length !== values.length) {
                  hasChanged = true;
                }
                memo[key2] = facetList;
                return memo;
              },
              {}
            );
            if (hasChanged) return newRefinementList;
            return refinementList;
          }
          return void 0;
        },
        /**
         * Test if the refinement value is used for the attribute. If no refinement value
         * is provided, test if the refinementList contains any refinement for the
         * given attribute.
         * @param {RefinementList} refinementList the list of refinement
         * @param {string} attribute name of the attribute
         * @param {string} [refinementValue] value of the filter/refinement
         * @return {boolean} true if the attribute is refined, false otherwise
         */
        isRefined: function isRefined(refinementList, attribute, refinementValue) {
          var containsRefinements = Boolean(refinementList[attribute]) && refinementList[attribute].length > 0;
          if (refinementValue === void 0 || !containsRefinements) {
            return containsRefinements;
          }
          var refinementValueAsString = "" + refinementValue;
          return refinementList[attribute].indexOf(refinementValueAsString) !== -1;
        }
      };
      module.exports = lib;
    }
  });

  // node_modules/algoliasearch-helper/src/SearchParameters/index.js
  var require_SearchParameters = __commonJS({
    "node_modules/algoliasearch-helper/src/SearchParameters/index.js"(exports, module) {
      "use strict";
      var defaultsPure = require_defaultsPure();
      var find2 = require_find();
      var intersection = require_intersection();
      var merge = require_merge();
      var objectHasKeys = require_objectHasKeys();
      var omit2 = require_omit();
      var valToNumber = require_valToNumber();
      var isValidUserToken = require_isValidUserToken();
      var RefinementList = require_RefinementList();
      function isEqualNumericRefinement(a2, b2) {
        if (Array.isArray(a2) && Array.isArray(b2)) {
          return a2.length === b2.length && a2.every(function(el, i2) {
            return isEqualNumericRefinement(b2[i2], el);
          });
        }
        return a2 === b2;
      }
      function findArray(array, searchedValue) {
        return find2(array, function(currentValue) {
          return isEqualNumericRefinement(currentValue, searchedValue);
        });
      }
      function SearchParameters(newParameters) {
        var params = newParameters ? SearchParameters._parseNumbers(newParameters) : {};
        if (params.userToken !== void 0 && !isValidUserToken(params.userToken)) {
          console.warn(
            "[algoliasearch-helper] The `userToken` parameter is invalid. This can lead to wrong analytics.\n  - Format: [a-zA-Z0-9_-]{1,64}"
          );
        }
        this.facets = params.facets || [];
        this.disjunctiveFacets = params.disjunctiveFacets || [];
        this.hierarchicalFacets = params.hierarchicalFacets || [];
        this.facetsRefinements = params.facetsRefinements || {};
        this.facetsExcludes = params.facetsExcludes || {};
        this.disjunctiveFacetsRefinements = params.disjunctiveFacetsRefinements || {};
        this.numericRefinements = params.numericRefinements || {};
        this.tagRefinements = params.tagRefinements || [];
        this.hierarchicalFacetsRefinements = params.hierarchicalFacetsRefinements || {};
        var self2 = this;
        Object.keys(params).forEach(function(paramName) {
          var isKeyKnown = SearchParameters.PARAMETERS.indexOf(paramName) !== -1;
          var isValueDefined = params[paramName] !== void 0;
          if (!isKeyKnown && isValueDefined) {
            self2[paramName] = params[paramName];
          }
        });
      }
      SearchParameters.PARAMETERS = Object.keys(new SearchParameters());
      SearchParameters._parseNumbers = function(partialState) {
        if (partialState instanceof SearchParameters) return partialState;
        var numbers = {};
        var numberKeys = [
          "aroundPrecision",
          "aroundRadius",
          "getRankingInfo",
          "minWordSizefor2Typos",
          "minWordSizefor1Typo",
          "page",
          "maxValuesPerFacet",
          "distinct",
          "minimumAroundRadius",
          "hitsPerPage",
          "minProximity"
        ];
        numberKeys.forEach(function(k2) {
          var value = partialState[k2];
          if (typeof value === "string") {
            var parsedValue = parseFloat(value);
            numbers[k2] = isNaN(parsedValue) ? value : parsedValue;
          }
        });
        if (Array.isArray(partialState.insideBoundingBox)) {
          numbers.insideBoundingBox = partialState.insideBoundingBox.map(function(geoRect) {
            if (Array.isArray(geoRect)) {
              return geoRect.map(function(value) {
                return parseFloat(value);
              });
            }
            return geoRect;
          });
        }
        if (partialState.numericRefinements) {
          var numericRefinements = {};
          Object.keys(partialState.numericRefinements).forEach(function(attribute) {
            var operators = partialState.numericRefinements[attribute] || {};
            numericRefinements[attribute] = {};
            Object.keys(operators).forEach(function(operator) {
              var values = operators[operator];
              var parsedValues = values.map(function(v2) {
                if (Array.isArray(v2)) {
                  return v2.map(function(vPrime) {
                    if (typeof vPrime === "string") {
                      return parseFloat(vPrime);
                    }
                    return vPrime;
                  });
                } else if (typeof v2 === "string") {
                  return parseFloat(v2);
                }
                return v2;
              });
              numericRefinements[attribute][operator] = parsedValues;
            });
          });
          numbers.numericRefinements = numericRefinements;
        }
        return merge(partialState, numbers);
      };
      SearchParameters.make = function makeSearchParameters(newParameters) {
        var instance = new SearchParameters(newParameters);
        var hierarchicalFacets = newParameters.hierarchicalFacets || [];
        hierarchicalFacets.forEach(function(facet) {
          if (facet.rootPath) {
            var currentRefinement = instance.getHierarchicalRefinement(facet.name);
            if (currentRefinement.length > 0 && currentRefinement[0].indexOf(facet.rootPath) !== 0) {
              instance = instance.clearRefinements(facet.name);
            }
            currentRefinement = instance.getHierarchicalRefinement(facet.name);
            if (currentRefinement.length === 0) {
              instance = instance.toggleHierarchicalFacetRefinement(
                facet.name,
                facet.rootPath
              );
            }
          }
        });
        return instance;
      };
      SearchParameters.validate = function(currentState, parameters) {
        var params = parameters || {};
        if (currentState.tagFilters && params.tagRefinements && params.tagRefinements.length > 0) {
          return new Error(
            "[Tags] Cannot switch from the managed tag API to the advanced API. It is probably an error, if it is really what you want, you should first clear the tags with clearTags method."
          );
        }
        if (currentState.tagRefinements.length > 0 && params.tagFilters) {
          return new Error(
            "[Tags] Cannot switch from the advanced tag API to the managed API. It is probably an error, if it is not, you should first clear the tags with clearTags method."
          );
        }
        if (currentState.numericFilters && params.numericRefinements && objectHasKeys(params.numericRefinements)) {
          return new Error(
            "[Numeric filters] Can't switch from the advanced to the managed API. It is probably an error, if this is really what you want, you have to first clear the numeric filters."
          );
        }
        if (objectHasKeys(currentState.numericRefinements) && params.numericFilters) {
          return new Error(
            "[Numeric filters] Can't switch from the managed API to the advanced. It is probably an error, if this is really what you want, you have to first clear the numeric filters."
          );
        }
        return null;
      };
      SearchParameters.prototype = {
        constructor: SearchParameters,
        /**
         * Remove all refinements (disjunctive + conjunctive + excludes + numeric filters)
         * @method
         * @param {undefined|string|SearchParameters.clearCallback} [attribute] optional string or function
         * - If not given, means to clear all the filters.
         * - If `string`, means to clear all refinements for the `attribute` named filter.
         * - If `function`, means to clear all the refinements that return truthy values.
         * @return {SearchParameters} new instance with filters cleared
         */
        clearRefinements: function clearRefinements(attribute) {
          var patch = {
            numericRefinements: this._clearNumericRefinements(attribute),
            facetsRefinements: RefinementList.clearRefinement(
              this.facetsRefinements,
              attribute,
              "conjunctiveFacet"
            ),
            facetsExcludes: RefinementList.clearRefinement(
              this.facetsExcludes,
              attribute,
              "exclude"
            ),
            disjunctiveFacetsRefinements: RefinementList.clearRefinement(
              this.disjunctiveFacetsRefinements,
              attribute,
              "disjunctiveFacet"
            ),
            hierarchicalFacetsRefinements: RefinementList.clearRefinement(
              this.hierarchicalFacetsRefinements,
              attribute,
              "hierarchicalFacet"
            )
          };
          if (patch.numericRefinements === this.numericRefinements && patch.facetsRefinements === this.facetsRefinements && patch.facetsExcludes === this.facetsExcludes && patch.disjunctiveFacetsRefinements === this.disjunctiveFacetsRefinements && patch.hierarchicalFacetsRefinements === this.hierarchicalFacetsRefinements) {
            return this;
          }
          return this.setQueryParameters(patch);
        },
        /**
         * Remove all the refined tags from the SearchParameters
         * @method
         * @return {SearchParameters} new instance with tags cleared
         */
        clearTags: function clearTags() {
          if (this.tagFilters === void 0 && this.tagRefinements.length === 0)
            return this;
          return this.setQueryParameters({
            tagFilters: void 0,
            tagRefinements: []
          });
        },
        /**
         * Set the index.
         * @method
         * @param {string} index the index name
         * @return {SearchParameters} new instance
         */
        setIndex: function setIndex(index3) {
          if (index3 === this.index) return this;
          return this.setQueryParameters({
            index: index3
          });
        },
        /**
         * Query setter
         * @method
         * @param {string} newQuery value for the new query
         * @return {SearchParameters} new instance
         */
        setQuery: function setQuery(newQuery) {
          if (newQuery === this.query) return this;
          return this.setQueryParameters({
            query: newQuery
          });
        },
        /**
         * Page setter
         * @method
         * @param {number} newPage new page number
         * @return {SearchParameters} new instance
         */
        setPage: function setPage(newPage) {
          if (newPage === this.page) return this;
          return this.setQueryParameters({
            page: newPage
          });
        },
        /**
         * Facets setter
         * The facets are the simple facets, used for conjunctive (and) faceting.
         * @method
         * @param {string[]} facets all the attributes of the algolia records used for conjunctive faceting
         * @return {SearchParameters} new instance
         */
        setFacets: function setFacets(facets) {
          return this.setQueryParameters({
            facets
          });
        },
        /**
         * Disjunctive facets setter
         * Change the list of disjunctive (or) facets the helper chan handle.
         * @method
         * @param {string[]} facets all the attributes of the algolia records used for disjunctive faceting
         * @return {SearchParameters} new instance
         */
        setDisjunctiveFacets: function setDisjunctiveFacets(facets) {
          return this.setQueryParameters({
            disjunctiveFacets: facets
          });
        },
        /**
         * HitsPerPage setter
         * Hits per page represents the number of hits retrieved for this query
         * @method
         * @param {number} n number of hits retrieved per page of results
         * @return {SearchParameters} new instance
         */
        setHitsPerPage: function setHitsPerPage(n3) {
          if (this.hitsPerPage === n3) return this;
          return this.setQueryParameters({
            hitsPerPage: n3
          });
        },
        /**
         * typoTolerance setter
         * Set the value of typoTolerance
         * @method
         * @param {string} typoTolerance new value of typoTolerance ("true", "false", "min" or "strict")
         * @return {SearchParameters} new instance
         */
        setTypoTolerance: function setTypoTolerance(typoTolerance) {
          if (this.typoTolerance === typoTolerance) return this;
          return this.setQueryParameters({
            typoTolerance
          });
        },
        /**
         * Add a numeric filter for a given attribute
         * When value is an array, they are combined with OR
         * When value is a single value, it will combined with AND
         * @method
         * @param {string} attribute attribute to set the filter on
         * @param {string} operator operator of the filter (possible values: =, >, >=, <, <=, !=)
         * @param {number | number[]} value value of the filter
         * @return {SearchParameters} new instance
         * @example
         * // for price = 50 or 40
         * state.addNumericRefinement('price', '=', [50, 40]);
         * @example
         * // for size = 38 and 40
         * state.addNumericRefinement('size', '=', 38);
         * state.addNumericRefinement('size', '=', 40);
         */
        addNumericRefinement: function(attribute, operator, value) {
          var val = valToNumber(value);
          if (this.isNumericRefined(attribute, operator, val)) return this;
          var mod = merge({}, this.numericRefinements);
          mod[attribute] = merge({}, mod[attribute]);
          if (mod[attribute][operator]) {
            mod[attribute][operator] = mod[attribute][operator].slice();
            mod[attribute][operator].push(val);
          } else {
            mod[attribute][operator] = [val];
          }
          return this.setQueryParameters({
            numericRefinements: mod
          });
        },
        /**
         * Get the list of conjunctive refinements for a single facet
         * @param {string} facetName name of the attribute used for faceting
         * @return {string[]} list of refinements
         */
        getConjunctiveRefinements: function(facetName) {
          if (!this.isConjunctiveFacet(facetName)) {
            return [];
          }
          return this.facetsRefinements[facetName] || [];
        },
        /**
         * Get the list of disjunctive refinements for a single facet
         * @param {string} facetName name of the attribute used for faceting
         * @return {string[]} list of refinements
         */
        getDisjunctiveRefinements: function(facetName) {
          if (!this.isDisjunctiveFacet(facetName)) {
            return [];
          }
          return this.disjunctiveFacetsRefinements[facetName] || [];
        },
        /**
         * Get the list of hierarchical refinements for a single facet
         * @param {string} facetName name of the attribute used for faceting
         * @return {string[]} list of refinements
         */
        getHierarchicalRefinement: function(facetName) {
          return this.hierarchicalFacetsRefinements[facetName] || [];
        },
        /**
         * Get the list of exclude refinements for a single facet
         * @param {string} facetName name of the attribute used for faceting
         * @return {string[]} list of refinements
         */
        getExcludeRefinements: function(facetName) {
          if (!this.isConjunctiveFacet(facetName)) {
            return [];
          }
          return this.facetsExcludes[facetName] || [];
        },
        /**
         * Remove all the numeric filter for a given (attribute, operator)
         * @method
         * @param {string} attribute attribute to set the filter on
         * @param {string} [operator] operator of the filter (possible values: =, >, >=, <, <=, !=)
         * @param {number} [number] the value to be removed
         * @return {SearchParameters} new instance
         */
        removeNumericRefinement: function(attribute, operator, number) {
          var paramValue = number;
          if (paramValue !== void 0) {
            if (!this.isNumericRefined(attribute, operator, paramValue)) {
              return this;
            }
            return this.setQueryParameters({
              numericRefinements: this._clearNumericRefinements(function(value, key2) {
                return key2 === attribute && value.op === operator && isEqualNumericRefinement(value.val, valToNumber(paramValue));
              })
            });
          } else if (operator !== void 0) {
            if (!this.isNumericRefined(attribute, operator)) return this;
            return this.setQueryParameters({
              numericRefinements: this._clearNumericRefinements(function(value, key2) {
                return key2 === attribute && value.op === operator;
              })
            });
          }
          if (!this.isNumericRefined(attribute)) return this;
          return this.setQueryParameters({
            numericRefinements: this._clearNumericRefinements(function(value, key2) {
              return key2 === attribute;
            })
          });
        },
        /**
         * Get the list of numeric refinements for a single facet
         * @param {string} facetName name of the attribute used for faceting
         * @return {SearchParameters.OperatorList} list of refinements
         */
        getNumericRefinements: function(facetName) {
          return this.numericRefinements[facetName] || {};
        },
        /**
         * Return the current refinement for the (attribute, operator)
         * @param {string} attribute attribute in the record
         * @param {string} operator operator applied on the refined values
         * @return {Array.<number|number[]>} refined values
         */
        getNumericRefinement: function(attribute, operator) {
          return this.numericRefinements[attribute] && this.numericRefinements[attribute][operator];
        },
        /**
         * Clear numeric filters.
         * @method
         * @private
         * @param {string|SearchParameters.clearCallback} [attribute] optional string or function
         * - If not given, means to clear all the filters.
         * - If `string`, means to clear all refinements for the `attribute` named filter.
         * - If `function`, means to clear all the refinements that return truthy values.
         * @return {Object.<string, OperatorList>} new numeric refinements
         */
        _clearNumericRefinements: function _clearNumericRefinements(attribute) {
          if (attribute === void 0) {
            if (!objectHasKeys(this.numericRefinements)) {
              return this.numericRefinements;
            }
            return {};
          } else if (typeof attribute === "string") {
            return omit2(this.numericRefinements, [attribute]);
          } else if (typeof attribute === "function") {
            var hasChanged = false;
            var numericRefinements = this.numericRefinements;
            var newNumericRefinements = Object.keys(numericRefinements).reduce(
              function(memo, key2) {
                var operators = numericRefinements[key2];
                var operatorList = {};
                operators = operators || {};
                Object.keys(operators).forEach(function(operator) {
                  var values = operators[operator] || [];
                  var outValues = [];
                  values.forEach(function(value) {
                    var predicateResult = attribute(
                      { val: value, op: operator },
                      key2,
                      "numeric"
                    );
                    if (!predicateResult) outValues.push(value);
                  });
                  if (outValues.length !== values.length) {
                    hasChanged = true;
                  }
                  operatorList[operator] = outValues;
                });
                memo[key2] = operatorList;
                return memo;
              },
              {}
            );
            if (hasChanged) return newNumericRefinements;
            return this.numericRefinements;
          }
          return void 0;
        },
        /**
         * Add a facet to the facets attribute of the helper configuration, if it
         * isn't already present.
         * @method
         * @param {string} facet facet name to add
         * @return {SearchParameters} new instance
         */
        addFacet: function addFacet(facet) {
          if (this.isConjunctiveFacet(facet)) {
            return this;
          }
          return this.setQueryParameters({
            facets: this.facets.concat([facet])
          });
        },
        /**
         * Add a disjunctive facet to the disjunctiveFacets attribute of the helper
         * configuration, if it isn't already present.
         * @method
         * @param {string} facet disjunctive facet name to add
         * @return {SearchParameters} new instance
         */
        addDisjunctiveFacet: function addDisjunctiveFacet(facet) {
          if (this.isDisjunctiveFacet(facet)) {
            return this;
          }
          return this.setQueryParameters({
            disjunctiveFacets: this.disjunctiveFacets.concat([facet])
          });
        },
        /**
         * Add a hierarchical facet to the hierarchicalFacets attribute of the helper
         * configuration.
         * @method
         * @param {object} hierarchicalFacet hierarchical facet to add
         * @return {SearchParameters} new instance
         * @throws will throw an error if a hierarchical facet with the same name was already declared
         */
        addHierarchicalFacet: function addHierarchicalFacet(hierarchicalFacet) {
          if (this.isHierarchicalFacet(hierarchicalFacet.name)) {
            throw new Error(
              "Cannot declare two hierarchical facets with the same name: `" + hierarchicalFacet.name + "`"
            );
          }
          return this.setQueryParameters({
            hierarchicalFacets: this.hierarchicalFacets.concat([hierarchicalFacet])
          });
        },
        /**
         * Add a refinement on a "normal" facet
         * @method
         * @param {string} facet attribute to apply the faceting on
         * @param {string} value value of the attribute (will be converted to string)
         * @return {SearchParameters} new instance
         */
        addFacetRefinement: function addFacetRefinement(facet, value) {
          if (!this.isConjunctiveFacet(facet)) {
            throw new Error(
              facet + " is not defined in the facets attribute of the helper configuration"
            );
          }
          if (RefinementList.isRefined(this.facetsRefinements, facet, value))
            return this;
          return this.setQueryParameters({
            facetsRefinements: RefinementList.addRefinement(
              this.facetsRefinements,
              facet,
              value
            )
          });
        },
        /**
         * Exclude a value from a "normal" facet
         * @method
         * @param {string} facet attribute to apply the exclusion on
         * @param {string} value value of the attribute (will be converted to string)
         * @return {SearchParameters} new instance
         */
        addExcludeRefinement: function addExcludeRefinement(facet, value) {
          if (!this.isConjunctiveFacet(facet)) {
            throw new Error(
              facet + " is not defined in the facets attribute of the helper configuration"
            );
          }
          if (RefinementList.isRefined(this.facetsExcludes, facet, value))
            return this;
          return this.setQueryParameters({
            facetsExcludes: RefinementList.addRefinement(
              this.facetsExcludes,
              facet,
              value
            )
          });
        },
        /**
         * Adds a refinement on a disjunctive facet.
         * @method
         * @param {string} facet attribute to apply the faceting on
         * @param {string} value value of the attribute (will be converted to string)
         * @return {SearchParameters} new instance
         */
        addDisjunctiveFacetRefinement: function addDisjunctiveFacetRefinement(facet, value) {
          if (!this.isDisjunctiveFacet(facet)) {
            throw new Error(
              facet + " is not defined in the disjunctiveFacets attribute of the helper configuration"
            );
          }
          if (RefinementList.isRefined(this.disjunctiveFacetsRefinements, facet, value))
            return this;
          return this.setQueryParameters({
            disjunctiveFacetsRefinements: RefinementList.addRefinement(
              this.disjunctiveFacetsRefinements,
              facet,
              value
            )
          });
        },
        /**
         * addTagRefinement adds a tag to the list used to filter the results
         * @param {string} tag tag to be added
         * @return {SearchParameters} new instance
         */
        addTagRefinement: function addTagRefinement(tag) {
          if (this.isTagRefined(tag)) return this;
          var modification = {
            tagRefinements: this.tagRefinements.concat(tag)
          };
          return this.setQueryParameters(modification);
        },
        /**
         * Remove a facet from the facets attribute of the helper configuration, if it
         * is present.
         * @method
         * @param {string} facet facet name to remove
         * @return {SearchParameters} new instance
         */
        removeFacet: function removeFacet(facet) {
          if (!this.isConjunctiveFacet(facet)) {
            return this;
          }
          return this.clearRefinements(facet).setQueryParameters({
            facets: this.facets.filter(function(f2) {
              return f2 !== facet;
            })
          });
        },
        /**
         * Remove a disjunctive facet from the disjunctiveFacets attribute of the
         * helper configuration, if it is present.
         * @method
         * @param {string} facet disjunctive facet name to remove
         * @return {SearchParameters} new instance
         */
        removeDisjunctiveFacet: function removeDisjunctiveFacet(facet) {
          if (!this.isDisjunctiveFacet(facet)) {
            return this;
          }
          return this.clearRefinements(facet).setQueryParameters({
            disjunctiveFacets: this.disjunctiveFacets.filter(function(f2) {
              return f2 !== facet;
            })
          });
        },
        /**
         * Remove a hierarchical facet from the hierarchicalFacets attribute of the
         * helper configuration, if it is present.
         * @method
         * @param {string} facet hierarchical facet name to remove
         * @return {SearchParameters} new instance
         */
        removeHierarchicalFacet: function removeHierarchicalFacet(facet) {
          if (!this.isHierarchicalFacet(facet)) {
            return this;
          }
          return this.clearRefinements(facet).setQueryParameters({
            hierarchicalFacets: this.hierarchicalFacets.filter(function(f2) {
              return f2.name !== facet;
            })
          });
        },
        /**
         * Remove a refinement set on facet. If a value is provided, it will clear the
         * refinement for the given value, otherwise it will clear all the refinement
         * values for the faceted attribute.
         * @method
         * @param {string} facet name of the attribute used for faceting
         * @param {string} [value] value used to filter
         * @return {SearchParameters} new instance
         */
        removeFacetRefinement: function removeFacetRefinement(facet, value) {
          if (!this.isConjunctiveFacet(facet)) {
            throw new Error(
              facet + " is not defined in the facets attribute of the helper configuration"
            );
          }
          if (!RefinementList.isRefined(this.facetsRefinements, facet, value))
            return this;
          return this.setQueryParameters({
            facetsRefinements: RefinementList.removeRefinement(
              this.facetsRefinements,
              facet,
              value
            )
          });
        },
        /**
         * Remove a negative refinement on a facet
         * @method
         * @param {string} facet name of the attribute used for faceting
         * @param {string} value value used to filter
         * @return {SearchParameters} new instance
         */
        removeExcludeRefinement: function removeExcludeRefinement(facet, value) {
          if (!this.isConjunctiveFacet(facet)) {
            throw new Error(
              facet + " is not defined in the facets attribute of the helper configuration"
            );
          }
          if (!RefinementList.isRefined(this.facetsExcludes, facet, value))
            return this;
          return this.setQueryParameters({
            facetsExcludes: RefinementList.removeRefinement(
              this.facetsExcludes,
              facet,
              value
            )
          });
        },
        /**
         * Remove a refinement on a disjunctive facet
         * @method
         * @param {string} facet name of the attribute used for faceting
         * @param {string} value value used to filter
         * @return {SearchParameters} new instance
         */
        removeDisjunctiveFacetRefinement: function removeDisjunctiveFacetRefinement(facet, value) {
          if (!this.isDisjunctiveFacet(facet)) {
            throw new Error(
              facet + " is not defined in the disjunctiveFacets attribute of the helper configuration"
            );
          }
          if (!RefinementList.isRefined(this.disjunctiveFacetsRefinements, facet, value))
            return this;
          return this.setQueryParameters({
            disjunctiveFacetsRefinements: RefinementList.removeRefinement(
              this.disjunctiveFacetsRefinements,
              facet,
              value
            )
          });
        },
        /**
         * Remove a tag from the list of tag refinements
         * @method
         * @param {string} tag the tag to remove
         * @return {SearchParameters} new instance
         */
        removeTagRefinement: function removeTagRefinement(tag) {
          if (!this.isTagRefined(tag)) return this;
          var modification = {
            tagRefinements: this.tagRefinements.filter(function(t3) {
              return t3 !== tag;
            })
          };
          return this.setQueryParameters(modification);
        },
        /**
         * Generic toggle refinement method to use with facet, disjunctive facets
         * and hierarchical facets
         * @param  {string} facet the facet to refine
         * @param  {string} value the associated value
         * @return {SearchParameters} new instance
         * @throws will throw an error if the facet is not declared in the settings of the helper
         * @deprecated since version 2.19.0, see {@link SearchParameters#toggleFacetRefinement}
         */
        toggleRefinement: function toggleRefinement(facet, value) {
          return this.toggleFacetRefinement(facet, value);
        },
        /**
         * Generic toggle refinement method to use with facet, disjunctive facets
         * and hierarchical facets
         * @param  {string} facet the facet to refine
         * @param  {string} value the associated value
         * @return {SearchParameters} new instance
         * @throws will throw an error if the facet is not declared in the settings of the helper
         */
        toggleFacetRefinement: function toggleFacetRefinement(facet, value) {
          if (this.isHierarchicalFacet(facet)) {
            return this.toggleHierarchicalFacetRefinement(facet, value);
          } else if (this.isConjunctiveFacet(facet)) {
            return this.toggleConjunctiveFacetRefinement(facet, value);
          } else if (this.isDisjunctiveFacet(facet)) {
            return this.toggleDisjunctiveFacetRefinement(facet, value);
          }
          throw new Error(
            "Cannot refine the undeclared facet " + facet + "; it should be added to the helper options facets, disjunctiveFacets or hierarchicalFacets"
          );
        },
        /**
         * Switch the refinement applied over a facet/value
         * @method
         * @param {string} facet name of the attribute used for faceting
         * @param {value} value value used for filtering
         * @return {SearchParameters} new instance
         */
        toggleConjunctiveFacetRefinement: function toggleConjunctiveFacetRefinement(facet, value) {
          if (!this.isConjunctiveFacet(facet)) {
            throw new Error(
              facet + " is not defined in the facets attribute of the helper configuration"
            );
          }
          return this.setQueryParameters({
            facetsRefinements: RefinementList.toggleRefinement(
              this.facetsRefinements,
              facet,
              value
            )
          });
        },
        /**
         * Switch the refinement applied over a facet/value
         * @method
         * @param {string} facet name of the attribute used for faceting
         * @param {value} value value used for filtering
         * @return {SearchParameters} new instance
         */
        toggleExcludeFacetRefinement: function toggleExcludeFacetRefinement(facet, value) {
          if (!this.isConjunctiveFacet(facet)) {
            throw new Error(
              facet + " is not defined in the facets attribute of the helper configuration"
            );
          }
          return this.setQueryParameters({
            facetsExcludes: RefinementList.toggleRefinement(
              this.facetsExcludes,
              facet,
              value
            )
          });
        },
        /**
         * Switch the refinement applied over a facet/value
         * @method
         * @param {string} facet name of the attribute used for faceting
         * @param {value} value value used for filtering
         * @return {SearchParameters} new instance
         */
        toggleDisjunctiveFacetRefinement: function toggleDisjunctiveFacetRefinement(facet, value) {
          if (!this.isDisjunctiveFacet(facet)) {
            throw new Error(
              facet + " is not defined in the disjunctiveFacets attribute of the helper configuration"
            );
          }
          return this.setQueryParameters({
            disjunctiveFacetsRefinements: RefinementList.toggleRefinement(
              this.disjunctiveFacetsRefinements,
              facet,
              value
            )
          });
        },
        /**
         * Switch the refinement applied over a facet/value
         * @method
         * @param {string} facet name of the attribute used for faceting
         * @param {value} value value used for filtering
         * @return {SearchParameters} new instance
         */
        toggleHierarchicalFacetRefinement: function toggleHierarchicalFacetRefinement(facet, value) {
          if (!this.isHierarchicalFacet(facet)) {
            throw new Error(
              facet + " is not defined in the hierarchicalFacets attribute of the helper configuration"
            );
          }
          var separator = this._getHierarchicalFacetSeparator(
            this.getHierarchicalFacetByName(facet)
          );
          var mod = {};
          var upOneOrMultipleLevel = this.hierarchicalFacetsRefinements[facet] !== void 0 && this.hierarchicalFacetsRefinements[facet].length > 0 && // remove current refinement:
          // refinement was 'beer > IPA', call is toggleRefine('beer > IPA'), refinement should be `beer`
          (this.hierarchicalFacetsRefinements[facet][0] === value || // remove a parent refinement of the current refinement:
          //  - refinement was 'beer > IPA > Flying dog'
          //  - call is toggleRefine('beer > IPA')
          //  - refinement should be `beer`
          this.hierarchicalFacetsRefinements[facet][0].indexOf(
            value + separator
          ) === 0);
          if (upOneOrMultipleLevel) {
            if (value.indexOf(separator) === -1) {
              mod[facet] = [];
            } else {
              mod[facet] = [value.slice(0, value.lastIndexOf(separator))];
            }
          } else {
            mod[facet] = [value];
          }
          return this.setQueryParameters({
            hierarchicalFacetsRefinements: defaultsPure(
              {},
              mod,
              this.hierarchicalFacetsRefinements
            )
          });
        },
        /**
         * Adds a refinement on a hierarchical facet.
         * @param {string} facet the facet name
         * @param {string} path the hierarchical facet path
         * @return {SearchParameter} the new state
         * @throws Error if the facet is not defined or if the facet is refined
         */
        addHierarchicalFacetRefinement: function(facet, path) {
          if (this.isHierarchicalFacetRefined(facet)) {
            throw new Error(facet + " is already refined.");
          }
          if (!this.isHierarchicalFacet(facet)) {
            throw new Error(
              facet + " is not defined in the hierarchicalFacets attribute of the helper configuration."
            );
          }
          var mod = {};
          mod[facet] = [path];
          return this.setQueryParameters({
            hierarchicalFacetsRefinements: defaultsPure(
              {},
              mod,
              this.hierarchicalFacetsRefinements
            )
          });
        },
        /**
         * Removes the refinement set on a hierarchical facet.
         * @param {string} facet the facet name
         * @return {SearchParameter} the new state
         * @throws Error if the facet is not defined or if the facet is not refined
         */
        removeHierarchicalFacetRefinement: function(facet) {
          if (!this.isHierarchicalFacetRefined(facet)) {
            return this;
          }
          var mod = {};
          mod[facet] = [];
          return this.setQueryParameters({
            hierarchicalFacetsRefinements: defaultsPure(
              {},
              mod,
              this.hierarchicalFacetsRefinements
            )
          });
        },
        /**
         * Switch the tag refinement
         * @method
         * @param {string} tag the tag to remove or add
         * @return {SearchParameters} new instance
         */
        toggleTagRefinement: function toggleTagRefinement(tag) {
          if (this.isTagRefined(tag)) {
            return this.removeTagRefinement(tag);
          }
          return this.addTagRefinement(tag);
        },
        /**
         * Test if the facet name is from one of the disjunctive facets
         * @method
         * @param {string} facet facet name to test
         * @return {boolean} true if facet is a disjunctive facet
         */
        isDisjunctiveFacet: function(facet) {
          return this.disjunctiveFacets.indexOf(facet) > -1;
        },
        /**
         * Test if the facet name is from one of the hierarchical facets
         * @method
         * @param {string} facetName facet name to test
         * @return {boolean} true if facetName is a hierarchical facet
         */
        isHierarchicalFacet: function(facetName) {
          return this.getHierarchicalFacetByName(facetName) !== void 0;
        },
        /**
         * Test if the facet name is from one of the conjunctive/normal facets
         * @method
         * @param {string} facet facet name to test
         * @return {boolean} true if facet is a conjunctive facet
         */
        isConjunctiveFacet: function(facet) {
          return this.facets.indexOf(facet) > -1;
        },
        /**
         * Returns true if the facet is refined, either for a specific value or in
         * general.
         * @method
         * @param {string} facet name of the attribute for used for faceting
         * @param {string} value, optional value. If passed will test that this value
         * is filtering the given facet.
         * @return {boolean} returns true if refined
         */
        isFacetRefined: function isFacetRefined(facet, value) {
          if (!this.isConjunctiveFacet(facet)) {
            return false;
          }
          return RefinementList.isRefined(this.facetsRefinements, facet, value);
        },
        /**
         * Returns true if the facet contains exclusions or if a specific value is
         * excluded.
         *
         * @method
         * @param {string} facet name of the attribute for used for faceting
         * @param {string} [value] optional value. If passed will test that this value
         * is filtering the given facet.
         * @return {boolean} returns true if refined
         */
        isExcludeRefined: function isExcludeRefined(facet, value) {
          if (!this.isConjunctiveFacet(facet)) {
            return false;
          }
          return RefinementList.isRefined(this.facetsExcludes, facet, value);
        },
        /**
         * Returns true if the facet contains a refinement, or if a value passed is a
         * refinement for the facet.
         * @method
         * @param {string} facet name of the attribute for used for faceting
         * @param {string} value optional, will test if the value is used for refinement
         * if there is one, otherwise will test if the facet contains any refinement
         * @return {boolean} true if the facet is refined
         */
        isDisjunctiveFacetRefined: function isDisjunctiveFacetRefined(facet, value) {
          if (!this.isDisjunctiveFacet(facet)) {
            return false;
          }
          return RefinementList.isRefined(
            this.disjunctiveFacetsRefinements,
            facet,
            value
          );
        },
        /**
         * Returns true if the facet contains a refinement, or if a value passed is a
         * refinement for the facet.
         * @method
         * @param {string} facet name of the attribute for used for faceting
         * @param {string} value optional, will test if the value is used for refinement
         * if there is one, otherwise will test if the facet contains any refinement
         * @return {boolean} true if the facet is refined
         */
        isHierarchicalFacetRefined: function isHierarchicalFacetRefined(facet, value) {
          if (!this.isHierarchicalFacet(facet)) {
            return false;
          }
          var refinements = this.getHierarchicalRefinement(facet);
          if (!value) {
            return refinements.length > 0;
          }
          return refinements.indexOf(value) !== -1;
        },
        /**
         * Test if the triple (attribute, operator, value) is already refined.
         * If only the attribute and the operator are provided, it tests if the
         * contains any refinement value.
         * @method
         * @param {string} attribute attribute for which the refinement is applied
         * @param {string} [operator] operator of the refinement
         * @param {string} [value] value of the refinement
         * @return {boolean} true if it is refined
         */
        isNumericRefined: function isNumericRefined(attribute, operator, value) {
          if (value === void 0 && operator === void 0) {
            return Boolean(this.numericRefinements[attribute]);
          }
          var isOperatorDefined = this.numericRefinements[attribute] && this.numericRefinements[attribute][operator] !== void 0;
          if (value === void 0 || !isOperatorDefined) {
            return isOperatorDefined;
          }
          var parsedValue = valToNumber(value);
          var isAttributeValueDefined = findArray(this.numericRefinements[attribute][operator], parsedValue) !== void 0;
          return isOperatorDefined && isAttributeValueDefined;
        },
        /**
         * Returns true if the tag refined, false otherwise
         * @method
         * @param {string} tag the tag to check
         * @return {boolean} true if tag is refined
         */
        isTagRefined: function isTagRefined(tag) {
          return this.tagRefinements.indexOf(tag) !== -1;
        },
        /**
         * Returns the list of all disjunctive facets refined
         * @method
         * @param {string} facet name of the attribute used for faceting
         * @param {value} value value used for filtering
         * @return {string[]} returns the list of refinements
         */
        getRefinedDisjunctiveFacets: function getRefinedDisjunctiveFacets() {
          var self2 = this;
          var disjunctiveNumericRefinedFacets = intersection(
            Object.keys(this.numericRefinements).filter(function(facet) {
              return Object.keys(self2.numericRefinements[facet]).length > 0;
            }),
            this.disjunctiveFacets
          );
          return Object.keys(this.disjunctiveFacetsRefinements).filter(function(facet) {
            return self2.disjunctiveFacetsRefinements[facet].length > 0;
          }).concat(disjunctiveNumericRefinedFacets).concat(this.getRefinedHierarchicalFacets()).sort();
        },
        /**
         * Returns the list of all disjunctive facets refined
         * @method
         * @param {string} facet name of the attribute used for faceting
         * @param {value} value value used for filtering
         * @return {string[]} returns the list of refinements
         */
        getRefinedHierarchicalFacets: function getRefinedHierarchicalFacets() {
          var self2 = this;
          return intersection(
            // enforce the order between the two arrays,
            // so that refinement name index === hierarchical facet index
            this.hierarchicalFacets.map(function(facet) {
              return facet.name;
            }),
            Object.keys(this.hierarchicalFacetsRefinements).filter(function(facet) {
              return self2.hierarchicalFacetsRefinements[facet].length > 0;
            })
          ).sort();
        },
        /**
         * Returned the list of all disjunctive facets not refined
         * @method
         * @return {string[]} returns the list of facets that are not refined
         */
        getUnrefinedDisjunctiveFacets: function() {
          var refinedFacets = this.getRefinedDisjunctiveFacets();
          return this.disjunctiveFacets.filter(function(f2) {
            return refinedFacets.indexOf(f2) === -1;
          });
        },
        managedParameters: [
          "index",
          "facets",
          "disjunctiveFacets",
          "facetsRefinements",
          "hierarchicalFacets",
          "facetsExcludes",
          "disjunctiveFacetsRefinements",
          "numericRefinements",
          "tagRefinements",
          "hierarchicalFacetsRefinements"
        ],
        getQueryParams: function getQueryParams() {
          var managedParameters = this.managedParameters;
          var queryParams = {};
          var self2 = this;
          Object.keys(this).forEach(function(paramName) {
            var paramValue = self2[paramName];
            if (managedParameters.indexOf(paramName) === -1 && paramValue !== void 0) {
              queryParams[paramName] = paramValue;
            }
          });
          return queryParams;
        },
        /**
         * Let the user set a specific value for a given parameter. Will return the
         * same instance if the parameter is invalid or if the value is the same as the
         * previous one.
         * @method
         * @param {string} parameter the parameter name
         * @param {any} value the value to be set, must be compliant with the definition
         * of the attribute on the object
         * @return {SearchParameters} the updated state
         */
        setQueryParameter: function setParameter(parameter, value) {
          if (this[parameter] === value) return this;
          var modification = {};
          modification[parameter] = value;
          return this.setQueryParameters(modification);
        },
        /**
         * Let the user set any of the parameters with a plain object.
         * @method
         * @param {object} params all the keys and the values to be updated
         * @return {SearchParameters} a new updated instance
         */
        setQueryParameters: function setQueryParameters(params) {
          if (!params) return this;
          var error = SearchParameters.validate(this, params);
          if (error) {
            throw error;
          }
          var self2 = this;
          var nextWithNumbers = SearchParameters._parseNumbers(params);
          var previousPlainObject = Object.keys(this).reduce(function(acc, key2) {
            acc[key2] = self2[key2];
            return acc;
          }, {});
          var nextPlainObject = Object.keys(nextWithNumbers).reduce(
            function(previous, key2) {
              var isPreviousValueDefined = previous[key2] !== void 0;
              var isNextValueDefined = nextWithNumbers[key2] !== void 0;
              if (isPreviousValueDefined && !isNextValueDefined) {
                return omit2(previous, [key2]);
              }
              if (isNextValueDefined) {
                previous[key2] = nextWithNumbers[key2];
              }
              return previous;
            },
            previousPlainObject
          );
          return new this.constructor(nextPlainObject);
        },
        /**
         * Returns a new instance with the page reset. Two scenarios possible:
         * the page is omitted -> return the given instance
         * the page is set -> return a new instance with a page of 0
         * @return {SearchParameters} a new updated instance
         */
        resetPage: function() {
          if (this.page === void 0) {
            return this;
          }
          return this.setPage(0);
        },
        /**
         * Helper function to get the hierarchicalFacet separator or the default one (`>`)
         * @param  {object} hierarchicalFacet the hierarchicalFacet object
         * @return {string} returns the hierarchicalFacet.separator or `>` as default
         */
        _getHierarchicalFacetSortBy: function(hierarchicalFacet) {
          return hierarchicalFacet.sortBy || ["isRefined:desc", "name:asc"];
        },
        /**
         * Helper function to get the hierarchicalFacet separator or the default one (`>`)
         * @private
         * @param  {object} hierarchicalFacet the hierarchicalFacet object
         * @return {string} returns the hierarchicalFacet.separator or `>` as default
         */
        _getHierarchicalFacetSeparator: function(hierarchicalFacet) {
          return hierarchicalFacet.separator || " > ";
        },
        /**
         * Helper function to get the hierarchicalFacet prefix path or null
         * @private
         * @param  {object} hierarchicalFacet the hierarchicalFacet object
         * @return {string} returns the hierarchicalFacet.rootPath or null as default
         */
        _getHierarchicalRootPath: function(hierarchicalFacet) {
          return hierarchicalFacet.rootPath || null;
        },
        /**
         * Helper function to check if we show the parent level of the hierarchicalFacet
         * @private
         * @param  {object} hierarchicalFacet the hierarchicalFacet object
         * @return {string} returns the hierarchicalFacet.showParentLevel or true as default
         */
        _getHierarchicalShowParentLevel: function(hierarchicalFacet) {
          if (typeof hierarchicalFacet.showParentLevel === "boolean") {
            return hierarchicalFacet.showParentLevel;
          }
          return true;
        },
        /**
         * Helper function to get the hierarchicalFacet by it's name
         * @param  {string} hierarchicalFacetName the hierarchicalFacet name
         * @return {object} a hierarchicalFacet
         */
        getHierarchicalFacetByName: function(hierarchicalFacetName) {
          return find2(this.hierarchicalFacets, function(f2) {
            return f2.name === hierarchicalFacetName;
          });
        },
        /**
         * Get the current breadcrumb for a hierarchical facet, as an array
         * @param  {string} facetName Hierarchical facet name
         * @return {array.<string>} the path as an array of string
         */
        getHierarchicalFacetBreadcrumb: function(facetName) {
          if (!this.isHierarchicalFacet(facetName)) {
            return [];
          }
          var refinement = this.getHierarchicalRefinement(facetName)[0];
          if (!refinement) return [];
          var separator = this._getHierarchicalFacetSeparator(
            this.getHierarchicalFacetByName(facetName)
          );
          var path = refinement.split(separator);
          return path.map(function(part) {
            return part.trim();
          });
        },
        toString: function() {
          return JSON.stringify(this, null, 2);
        }
      };
      module.exports = SearchParameters;
    }
  });

  // node_modules/algoliasearch-helper/src/functions/compact.js
  var require_compact = __commonJS({
    "node_modules/algoliasearch-helper/src/functions/compact.js"(exports, module) {
      "use strict";
      module.exports = function compact(array) {
        if (!Array.isArray(array)) {
          return [];
        }
        return array.filter(Boolean);
      };
    }
  });

  // node_modules/algoliasearch-helper/src/functions/findIndex.js
  var require_findIndex = __commonJS({
    "node_modules/algoliasearch-helper/src/functions/findIndex.js"(exports, module) {
      "use strict";
      module.exports = function find2(array, comparator) {
        if (!Array.isArray(array)) {
          return -1;
        }
        for (var i2 = 0; i2 < array.length; i2++) {
          if (comparator(array[i2])) {
            return i2;
          }
        }
        return -1;
      };
    }
  });

  // node_modules/algoliasearch-helper/src/functions/formatSort.js
  var require_formatSort = __commonJS({
    "node_modules/algoliasearch-helper/src/functions/formatSort.js"(exports, module) {
      "use strict";
      var find2 = require_find();
      module.exports = function formatSort(sortBy, defaults) {
        var defaultInstructions = (defaults || []).map(function(sort) {
          return sort.split(":");
        });
        return sortBy.reduce(
          function preparePredicate(out, sort) {
            var sortInstruction = sort.split(":");
            var matchingDefault = find2(
              defaultInstructions,
              function(defaultInstruction) {
                return defaultInstruction[0] === sortInstruction[0];
              }
            );
            if (sortInstruction.length > 1 || !matchingDefault) {
              out[0].push(sortInstruction[0]);
              out[1].push(sortInstruction[1]);
              return out;
            }
            out[0].push(matchingDefault[0]);
            out[1].push(matchingDefault[1]);
            return out;
          },
          [[], []]
        );
      };
    }
  });

  // node_modules/algoliasearch-helper/src/functions/orderBy.js
  var require_orderBy = __commonJS({
    "node_modules/algoliasearch-helper/src/functions/orderBy.js"(exports, module) {
      "use strict";
      function compareAscending(value, other) {
        if (value !== other) {
          var valIsDefined = value !== void 0;
          var valIsNull = value === null;
          var othIsDefined = other !== void 0;
          var othIsNull = other === null;
          if (!othIsNull && value > other || valIsNull && othIsDefined || !valIsDefined) {
            return 1;
          }
          if (!valIsNull && value < other || othIsNull && valIsDefined || !othIsDefined) {
            return -1;
          }
        }
        return 0;
      }
      function orderBy(collection, iteratees, orders) {
        if (!Array.isArray(collection)) {
          return [];
        }
        if (!Array.isArray(orders)) {
          orders = [];
        }
        var result = collection.map(function(value, index3) {
          return {
            criteria: iteratees.map(function(iteratee) {
              return value[iteratee];
            }),
            index: index3,
            value
          };
        });
        result.sort(function comparer(object, other) {
          var index3 = -1;
          while (++index3 < object.criteria.length) {
            var res = compareAscending(object.criteria[index3], other.criteria[index3]);
            if (res) {
              if (index3 >= orders.length) {
                return res;
              }
              if (orders[index3] === "desc") {
                return -res;
              }
              return res;
            }
          }
          return object.index - other.index;
        });
        return result.map(function(res) {
          return res.value;
        });
      }
      module.exports = orderBy;
    }
  });

  // node_modules/algoliasearch-helper/src/SearchResults/generate-hierarchical-tree.js
  var require_generate_hierarchical_tree = __commonJS({
    "node_modules/algoliasearch-helper/src/SearchResults/generate-hierarchical-tree.js"(exports, module) {
      "use strict";
      module.exports = generateTrees;
      var fv = require_escapeFacetValue();
      var find2 = require_find();
      var prepareHierarchicalFacetSortBy = require_formatSort();
      var orderBy = require_orderBy();
      var escapeFacetValue = fv.escapeFacetValue;
      var unescapeFacetValue = fv.unescapeFacetValue;
      function generateTrees(state) {
        return function generate(hierarchicalFacetResult, hierarchicalFacetIndex) {
          var hierarchicalFacet = state.hierarchicalFacets[hierarchicalFacetIndex];
          var hierarchicalFacetRefinement = state.hierarchicalFacetsRefinements[hierarchicalFacet.name] && state.hierarchicalFacetsRefinements[hierarchicalFacet.name][0] || "";
          var hierarchicalSeparator = state._getHierarchicalFacetSeparator(hierarchicalFacet);
          var hierarchicalRootPath = state._getHierarchicalRootPath(hierarchicalFacet);
          var hierarchicalShowParentLevel = state._getHierarchicalShowParentLevel(hierarchicalFacet);
          var sortBy = prepareHierarchicalFacetSortBy(
            state._getHierarchicalFacetSortBy(hierarchicalFacet)
          );
          var rootExhaustive = hierarchicalFacetResult.every(function(facetResult) {
            return facetResult.exhaustive;
          });
          var generateTreeFn = generateHierarchicalTree(
            sortBy,
            hierarchicalSeparator,
            hierarchicalRootPath,
            hierarchicalShowParentLevel,
            hierarchicalFacetRefinement
          );
          var results = hierarchicalFacetResult;
          if (hierarchicalRootPath) {
            results = hierarchicalFacetResult.slice(
              hierarchicalRootPath.split(hierarchicalSeparator).length
            );
          }
          return results.reduce(generateTreeFn, {
            name: state.hierarchicalFacets[hierarchicalFacetIndex].name,
            count: null,
            // root level, no count
            isRefined: true,
            // root level, always refined
            path: null,
            // root level, no path
            escapedValue: null,
            exhaustive: rootExhaustive,
            data: null
          });
        };
      }
      function generateHierarchicalTree(sortBy, hierarchicalSeparator, hierarchicalRootPath, hierarchicalShowParentLevel, currentRefinement) {
        return function generateTree(hierarchicalTree, hierarchicalFacetResult, currentHierarchicalLevel) {
          var parent = hierarchicalTree;
          if (currentHierarchicalLevel > 0) {
            var level = 0;
            parent = hierarchicalTree;
            while (level < currentHierarchicalLevel) {
              var data = parent && Array.isArray(parent.data) ? parent.data : [];
              parent = find2(data, function(subtree) {
                return subtree.isRefined;
              });
              level++;
            }
          }
          if (parent) {
            var picked = Object.keys(hierarchicalFacetResult.data).map(function(facetValue) {
              return [facetValue, hierarchicalFacetResult.data[facetValue]];
            }).filter(function(tuple) {
              var facetValue = tuple[0];
              return onlyMatchingTree(
                facetValue,
                parent.path || hierarchicalRootPath,
                currentRefinement,
                hierarchicalSeparator,
                hierarchicalRootPath,
                hierarchicalShowParentLevel
              );
            });
            parent.data = orderBy(
              picked.map(function(tuple) {
                var facetValue = tuple[0];
                var facetCount = tuple[1];
                return format(
                  facetCount,
                  facetValue,
                  hierarchicalSeparator,
                  unescapeFacetValue(currentRefinement),
                  hierarchicalFacetResult.exhaustive
                );
              }),
              sortBy[0],
              sortBy[1]
            );
          }
          return hierarchicalTree;
        };
      }
      function onlyMatchingTree(facetValue, parentPath, currentRefinement, hierarchicalSeparator, hierarchicalRootPath, hierarchicalShowParentLevel) {
        if (hierarchicalRootPath && (facetValue.indexOf(hierarchicalRootPath) !== 0 || hierarchicalRootPath === facetValue)) {
          return false;
        }
        return !hierarchicalRootPath && facetValue.indexOf(hierarchicalSeparator) === -1 || // if there is a rootPath, being root level mean 1 level under rootPath
        hierarchicalRootPath && facetValue.split(hierarchicalSeparator).length - hierarchicalRootPath.split(hierarchicalSeparator).length === 1 || // if current refinement is a root level and current facetValue is a root level,
        // keep the facetValue
        facetValue.indexOf(hierarchicalSeparator) === -1 && currentRefinement.indexOf(hierarchicalSeparator) === -1 || // currentRefinement is a child of the facet value
        currentRefinement.indexOf(facetValue) === 0 || // facetValue is a child of the current parent, add it
        facetValue.indexOf(parentPath + hierarchicalSeparator) === 0 && (hierarchicalShowParentLevel || facetValue.indexOf(currentRefinement) === 0);
      }
      function format(facetCount, facetValue, hierarchicalSeparator, currentRefinement, exhaustive) {
        var parts = facetValue.split(hierarchicalSeparator);
        return {
          name: parts[parts.length - 1].trim(),
          path: facetValue,
          escapedValue: escapeFacetValue(facetValue),
          count: facetCount,
          isRefined: currentRefinement === facetValue || currentRefinement.indexOf(facetValue + hierarchicalSeparator) === 0,
          exhaustive,
          data: null
        };
      }
    }
  });

  // node_modules/algoliasearch-helper/src/SearchResults/index.js
  var require_SearchResults = __commonJS({
    "node_modules/algoliasearch-helper/src/SearchResults/index.js"(exports, module) {
      "use strict";
      var compact = require_compact();
      var defaultsPure = require_defaultsPure();
      var fv = require_escapeFacetValue();
      var find2 = require_find();
      var findIndex2 = require_findIndex();
      var formatSort = require_formatSort();
      var merge = require_merge();
      var orderBy = require_orderBy();
      var escapeFacetValue = fv.escapeFacetValue;
      var unescapeFacetValue = fv.unescapeFacetValue;
      var generateHierarchicalTree = require_generate_hierarchical_tree();
      function getIndices(attributes) {
        var indices = {};
        attributes.forEach(function(val, idx) {
          indices[val] = idx;
        });
        return indices;
      }
      function assignFacetStats(dest, facetStats, key2) {
        if (facetStats && facetStats[key2]) {
          dest.stats = facetStats[key2];
        }
      }
      function findMatchingHierarchicalFacetFromAttributeName(hierarchicalFacets, hierarchicalAttributeName) {
        return find2(
          hierarchicalFacets,
          function facetKeyMatchesAttribute(hierarchicalFacet) {
            var facetNames = hierarchicalFacet.attributes || [];
            return facetNames.indexOf(hierarchicalAttributeName) > -1;
          }
        );
      }
      function SearchResults(state, results, options) {
        var mainSubResponse = results[0];
        this._rawResults = results;
        var self2 = this;
        Object.keys(mainSubResponse).forEach(function(key2) {
          self2[key2] = mainSubResponse[key2];
        });
        var opts = merge(
          {
            persistHierarchicalRootCount: false
          },
          options
        );
        Object.keys(opts).forEach(function(key2) {
          self2[key2] = opts[key2];
        });
        this.processingTimeMS = results.reduce(function(sum, result) {
          return result.processingTimeMS === void 0 ? sum : sum + result.processingTimeMS;
        }, 0);
        this.disjunctiveFacets = [];
        this.hierarchicalFacets = state.hierarchicalFacets.map(
          function initFutureTree() {
            return [];
          }
        );
        this.facets = [];
        var disjunctiveFacets = state.getRefinedDisjunctiveFacets();
        var facetsIndices = getIndices(state.facets);
        var disjunctiveFacetsIndices = getIndices(state.disjunctiveFacets);
        var nextDisjunctiveResult = 1;
        var mainFacets = mainSubResponse.facets || {};
        Object.keys(mainFacets).forEach(function(facetKey) {
          var facetValueObject = mainFacets[facetKey];
          var hierarchicalFacet = findMatchingHierarchicalFacetFromAttributeName(
            state.hierarchicalFacets,
            facetKey
          );
          if (hierarchicalFacet) {
            var facetIndex = hierarchicalFacet.attributes.indexOf(facetKey);
            var idxAttributeName = findIndex2(state.hierarchicalFacets, function(f2) {
              return f2.name === hierarchicalFacet.name;
            });
            self2.hierarchicalFacets[idxAttributeName][facetIndex] = {
              attribute: facetKey,
              data: facetValueObject,
              exhaustive: mainSubResponse.exhaustiveFacetsCount
            };
          } else {
            var isFacetDisjunctive = state.disjunctiveFacets.indexOf(facetKey) !== -1;
            var isFacetConjunctive = state.facets.indexOf(facetKey) !== -1;
            var position;
            if (isFacetDisjunctive) {
              position = disjunctiveFacetsIndices[facetKey];
              self2.disjunctiveFacets[position] = {
                name: facetKey,
                data: facetValueObject,
                exhaustive: mainSubResponse.exhaustiveFacetsCount
              };
              assignFacetStats(
                self2.disjunctiveFacets[position],
                mainSubResponse.facets_stats,
                facetKey
              );
            }
            if (isFacetConjunctive) {
              position = facetsIndices[facetKey];
              self2.facets[position] = {
                name: facetKey,
                data: facetValueObject,
                exhaustive: mainSubResponse.exhaustiveFacetsCount
              };
              assignFacetStats(
                self2.facets[position],
                mainSubResponse.facets_stats,
                facetKey
              );
            }
          }
        });
        this.hierarchicalFacets = compact(this.hierarchicalFacets);
        disjunctiveFacets.forEach(function(disjunctiveFacet) {
          var result = results[nextDisjunctiveResult];
          var facets = result && result.facets ? result.facets : {};
          var hierarchicalFacet = state.getHierarchicalFacetByName(disjunctiveFacet);
          Object.keys(facets).forEach(function(dfacet) {
            var facetResults = facets[dfacet];
            var position;
            if (hierarchicalFacet) {
              position = findIndex2(state.hierarchicalFacets, function(f2) {
                return f2.name === hierarchicalFacet.name;
              });
              var attributeIndex = findIndex2(
                self2.hierarchicalFacets[position],
                function(f2) {
                  return f2.attribute === dfacet;
                }
              );
              if (attributeIndex === -1) {
                return;
              }
              self2.hierarchicalFacets[position][attributeIndex].data = merge(
                {},
                self2.hierarchicalFacets[position][attributeIndex].data,
                facetResults
              );
            } else {
              position = disjunctiveFacetsIndices[dfacet];
              var dataFromMainRequest = mainSubResponse.facets && mainSubResponse.facets[dfacet] || {};
              self2.disjunctiveFacets[position] = {
                name: dfacet,
                data: defaultsPure({}, facetResults, dataFromMainRequest),
                exhaustive: result.exhaustiveFacetsCount
              };
              assignFacetStats(
                self2.disjunctiveFacets[position],
                result.facets_stats,
                dfacet
              );
              if (state.disjunctiveFacetsRefinements[dfacet]) {
                state.disjunctiveFacetsRefinements[dfacet].forEach(function(refinementValue) {
                  if (!self2.disjunctiveFacets[position].data[refinementValue] && state.disjunctiveFacetsRefinements[dfacet].indexOf(
                    unescapeFacetValue(refinementValue)
                  ) > -1) {
                    self2.disjunctiveFacets[position].data[refinementValue] = 0;
                  }
                });
              }
            }
          });
          nextDisjunctiveResult++;
        });
        state.getRefinedHierarchicalFacets().forEach(function(refinedFacet) {
          var hierarchicalFacet = state.getHierarchicalFacetByName(refinedFacet);
          var separator = state._getHierarchicalFacetSeparator(hierarchicalFacet);
          var currentRefinement = state.getHierarchicalRefinement(refinedFacet);
          if (currentRefinement.length === 0 || currentRefinement[0].split(separator).length < 2) {
            return;
          }
          results.slice(nextDisjunctiveResult).forEach(function(result) {
            var facets = result && result.facets ? result.facets : {};
            Object.keys(facets).forEach(function(dfacet) {
              var facetResults = facets[dfacet];
              var position = findIndex2(state.hierarchicalFacets, function(f2) {
                return f2.name === hierarchicalFacet.name;
              });
              var attributeIndex = findIndex2(
                self2.hierarchicalFacets[position],
                function(f2) {
                  return f2.attribute === dfacet;
                }
              );
              if (attributeIndex === -1) {
                return;
              }
              var defaultData = {};
              if (currentRefinement.length > 0 && !self2.persistHierarchicalRootCount) {
                var root = currentRefinement[0].split(separator)[0];
                defaultData[root] = self2.hierarchicalFacets[position][attributeIndex].data[root];
              }
              self2.hierarchicalFacets[position][attributeIndex].data = defaultsPure(
                defaultData,
                facetResults,
                self2.hierarchicalFacets[position][attributeIndex].data
              );
            });
            nextDisjunctiveResult++;
          });
        });
        Object.keys(state.facetsExcludes).forEach(function(facetName) {
          var excludes = state.facetsExcludes[facetName];
          var position = facetsIndices[facetName];
          self2.facets[position] = {
            name: facetName,
            data: mainFacets[facetName],
            exhaustive: mainSubResponse.exhaustiveFacetsCount
          };
          excludes.forEach(function(facetValue) {
            self2.facets[position] = self2.facets[position] || { name: facetName };
            self2.facets[position].data = self2.facets[position].data || {};
            self2.facets[position].data[facetValue] = 0;
          });
        });
        this.hierarchicalFacets = this.hierarchicalFacets.map(
          generateHierarchicalTree(state)
        );
        this.facets = compact(this.facets);
        this.disjunctiveFacets = compact(this.disjunctiveFacets);
        this._state = state;
      }
      SearchResults.prototype.getFacetByName = function(name) {
        function predicate(facet) {
          return facet.name === name;
        }
        return find2(this.facets, predicate) || find2(this.disjunctiveFacets, predicate) || find2(this.hierarchicalFacets, predicate);
      };
      function extractNormalizedFacetValues(results, attribute) {
        function predicate(facet2) {
          return facet2.name === attribute;
        }
        if (results._state.isConjunctiveFacet(attribute)) {
          var facet = find2(results.facets, predicate);
          if (!facet) return [];
          return Object.keys(facet.data).map(function(name) {
            var value = escapeFacetValue(name);
            return {
              name,
              escapedValue: value,
              count: facet.data[name],
              isRefined: results._state.isFacetRefined(attribute, value),
              isExcluded: results._state.isExcludeRefined(attribute, name)
            };
          });
        } else if (results._state.isDisjunctiveFacet(attribute)) {
          var disjunctiveFacet = find2(results.disjunctiveFacets, predicate);
          if (!disjunctiveFacet) return [];
          return Object.keys(disjunctiveFacet.data).map(function(name) {
            var value = escapeFacetValue(name);
            return {
              name,
              escapedValue: value,
              count: disjunctiveFacet.data[name],
              isRefined: results._state.isDisjunctiveFacetRefined(attribute, value)
            };
          });
        } else if (results._state.isHierarchicalFacet(attribute)) {
          var hierarchicalFacetValues = find2(results.hierarchicalFacets, predicate);
          if (!hierarchicalFacetValues) return hierarchicalFacetValues;
          var hierarchicalFacet = results._state.getHierarchicalFacetByName(attribute);
          var separator = results._state._getHierarchicalFacetSeparator(hierarchicalFacet);
          var currentRefinement = unescapeFacetValue(
            results._state.getHierarchicalRefinement(attribute)[0] || ""
          );
          if (currentRefinement.indexOf(hierarchicalFacet.rootPath) === 0) {
            currentRefinement = currentRefinement.replace(
              hierarchicalFacet.rootPath + separator,
              ""
            );
          }
          var currentRefinementSplit = currentRefinement.split(separator);
          currentRefinementSplit.unshift(attribute);
          setIsRefined(hierarchicalFacetValues, currentRefinementSplit, 0);
          return hierarchicalFacetValues;
        }
        return void 0;
      }
      function setIsRefined(item3, currentRefinement, depth) {
        item3.isRefined = item3.name === (currentRefinement[depth] && currentRefinement[depth].trim());
        if (item3.data) {
          item3.data.forEach(function(child) {
            setIsRefined(child, currentRefinement, depth + 1);
          });
        }
      }
      function recSort(sortFn, node, names, level) {
        level = level || 0;
        if (Array.isArray(node)) {
          return sortFn(node, names[level]);
        }
        if (!node.data || node.data.length === 0) {
          return node;
        }
        var children = node.data.map(function(childNode) {
          return recSort(sortFn, childNode, names, level + 1);
        });
        var sortedChildren = sortFn(children, names[level]);
        var newNode = defaultsPure({ data: sortedChildren }, node);
        return newNode;
      }
      SearchResults.DEFAULT_SORT = ["isRefined:desc", "count:desc", "name:asc"];
      function vanillaSortFn(order, data) {
        return data.sort(order);
      }
      function sortViaFacetOrdering(facetValues, facetOrdering) {
        var orderedFacets = [];
        var remainingFacets = [];
        var order = facetOrdering.order || [];
        var reverseOrder = order.reduce(function(acc, name, i2) {
          acc[name] = i2;
          return acc;
        }, {});
        facetValues.forEach(function(item3) {
          var name = item3.path || item3.name;
          if (reverseOrder[name] !== void 0) {
            orderedFacets[reverseOrder[name]] = item3;
          } else {
            remainingFacets.push(item3);
          }
        });
        orderedFacets = orderedFacets.filter(function(facet) {
          return facet;
        });
        var sortRemainingBy = facetOrdering.sortRemainingBy;
        var ordering;
        if (sortRemainingBy === "hidden") {
          return orderedFacets;
        } else if (sortRemainingBy === "alpha") {
          ordering = [
            ["path", "name"],
            ["asc", "asc"]
          ];
        } else {
          ordering = [["count"], ["desc"]];
        }
        return orderedFacets.concat(
          orderBy(remainingFacets, ordering[0], ordering[1])
        );
      }
      function getFacetOrdering(results, attribute) {
        return results.renderingContent && results.renderingContent.facetOrdering && results.renderingContent.facetOrdering.values && results.renderingContent.facetOrdering.values[attribute];
      }
      SearchResults.prototype.getFacetValues = function(attribute, opts) {
        var facetValues = extractNormalizedFacetValues(this, attribute);
        if (!facetValues) {
          return void 0;
        }
        var options = defaultsPure({}, opts, {
          sortBy: SearchResults.DEFAULT_SORT,
          // if no sortBy is given, attempt to sort based on facetOrdering
          // if it is given, we still allow to sort via facet ordering first
          facetOrdering: !(opts && opts.sortBy)
        });
        var results = this;
        var attributes;
        if (Array.isArray(facetValues)) {
          attributes = [attribute];
        } else {
          var config = results._state.getHierarchicalFacetByName(facetValues.name);
          attributes = config.attributes;
        }
        return recSort(
          function(data, facetName) {
            if (options.facetOrdering) {
              var facetOrdering = getFacetOrdering(results, facetName);
              if (facetOrdering) {
                return sortViaFacetOrdering(data, facetOrdering);
              }
            }
            if (Array.isArray(options.sortBy)) {
              var order = formatSort(options.sortBy, SearchResults.DEFAULT_SORT);
              return orderBy(data, order[0], order[1]);
            } else if (typeof options.sortBy === "function") {
              return vanillaSortFn(options.sortBy, data);
            }
            throw new Error(
              "options.sortBy is optional but if defined it must be either an array of string (predicates) or a sorting function"
            );
          },
          facetValues,
          attributes
        );
      };
      SearchResults.prototype.getFacetStats = function(attribute) {
        if (this._state.isConjunctiveFacet(attribute)) {
          return getFacetStatsIfAvailable(this.facets, attribute);
        } else if (this._state.isDisjunctiveFacet(attribute)) {
          return getFacetStatsIfAvailable(this.disjunctiveFacets, attribute);
        }
        return void 0;
      };
      function getFacetStatsIfAvailable(facetList, facetName) {
        var data = find2(facetList, function(facet) {
          return facet.name === facetName;
        });
        return data && data.stats;
      }
      SearchResults.prototype.getRefinements = function() {
        var state = this._state;
        var results = this;
        var res = [];
        Object.keys(state.facetsRefinements).forEach(function(attributeName) {
          state.facetsRefinements[attributeName].forEach(function(name) {
            res.push(
              getRefinement(state, "facet", attributeName, name, results.facets)
            );
          });
        });
        Object.keys(state.facetsExcludes).forEach(function(attributeName) {
          state.facetsExcludes[attributeName].forEach(function(name) {
            res.push(
              getRefinement(state, "exclude", attributeName, name, results.facets)
            );
          });
        });
        Object.keys(state.disjunctiveFacetsRefinements).forEach(function(attributeName) {
          state.disjunctiveFacetsRefinements[attributeName].forEach(function(name) {
            res.push(
              getRefinement(
                state,
                "disjunctive",
                attributeName,
                name,
                results.disjunctiveFacets
              )
            );
          });
        });
        Object.keys(state.hierarchicalFacetsRefinements).forEach(function(attributeName) {
          state.hierarchicalFacetsRefinements[attributeName].forEach(function(name) {
            res.push(
              getHierarchicalRefinement(
                state,
                attributeName,
                name,
                results.hierarchicalFacets
              )
            );
          });
        });
        Object.keys(state.numericRefinements).forEach(function(attributeName) {
          var operators = state.numericRefinements[attributeName];
          Object.keys(operators).forEach(function(operator) {
            operators[operator].forEach(function(value) {
              res.push({
                type: "numeric",
                attributeName,
                name: value,
                numericValue: value,
                operator
              });
            });
          });
        });
        state.tagRefinements.forEach(function(name) {
          res.push({ type: "tag", attributeName: "_tags", name });
        });
        return res;
      };
      function getRefinement(state, type, attributeName, name, resultsFacets) {
        var facet = find2(resultsFacets, function(f2) {
          return f2.name === attributeName;
        });
        var count = facet && facet.data && facet.data[name] ? facet.data[name] : 0;
        var exhaustive = facet && facet.exhaustive || false;
        return {
          type,
          attributeName,
          name,
          count,
          exhaustive
        };
      }
      function getHierarchicalRefinement(state, attributeName, name, resultsFacets) {
        var facetDeclaration = state.getHierarchicalFacetByName(attributeName);
        var separator = state._getHierarchicalFacetSeparator(facetDeclaration);
        var split = name.split(separator);
        var rootFacet = find2(resultsFacets, function(facet2) {
          return facet2.name === attributeName;
        });
        var facet = split.reduce(function(intermediateFacet, part) {
          var newFacet = intermediateFacet && find2(intermediateFacet.data, function(f2) {
            return f2.name === part;
          });
          return newFacet !== void 0 ? newFacet : intermediateFacet;
        }, rootFacet);
        var count = facet && facet.count || 0;
        var exhaustive = facet && facet.exhaustive || false;
        var path = facet && facet.path || "";
        return {
          type: "hierarchical",
          attributeName,
          name: path,
          count,
          exhaustive
        };
      }
      module.exports = SearchResults;
    }
  });

  // node_modules/algoliasearch-helper/src/functions/flat.js
  var require_flat = __commonJS({
    "node_modules/algoliasearch-helper/src/functions/flat.js"(exports, module) {
      module.exports = function flat(arr) {
        return arr.reduce(function(acc, val) {
          return acc.concat(val);
        }, []);
      };
    }
  });

  // node_modules/algoliasearch-helper/src/utils/sortAndMergeRecommendations.js
  var require_sortAndMergeRecommendations = __commonJS({
    "node_modules/algoliasearch-helper/src/utils/sortAndMergeRecommendations.js"(exports, module) {
      "use strict";
      var find2 = require_find();
      var flat = require_flat();
      function getAverageIndices(indexTracker, nrOfObjs) {
        var avgIndices = [];
        Object.keys(indexTracker).forEach(function(key2) {
          if (indexTracker[key2].count < 2) {
            indexTracker[key2].indexSum += 100;
          }
          avgIndices.push({
            objectID: key2,
            avgOfIndices: indexTracker[key2].indexSum / nrOfObjs
          });
        });
        return avgIndices.sort(function(a2, b2) {
          return a2.avgOfIndices > b2.avgOfIndices ? 1 : -1;
        });
      }
      function sortAndMergeRecommendations(results) {
        var indexTracker = {};
        results.forEach(function(hits2) {
          hits2.forEach(function(hit, index3) {
            if (!indexTracker[hit.objectID]) {
              indexTracker[hit.objectID] = { indexSum: index3, count: 1 };
            } else {
              indexTracker[hit.objectID] = {
                indexSum: indexTracker[hit.objectID].indexSum + index3,
                count: indexTracker[hit.objectID].count + 1
              };
            }
          });
        });
        var sortedAverageIndices = getAverageIndices(indexTracker, results.length);
        var finalOrder = sortedAverageIndices.reduce(
          function(orderedHits, avgIndexRef) {
            var result = find2(flat(results), function(hit) {
              return hit.objectID === avgIndexRef.objectID;
            });
            return result ? orderedHits.concat(result) : orderedHits;
          },
          []
        );
        return finalOrder;
      }
      module.exports = sortAndMergeRecommendations;
    }
  });

  // node_modules/algoliasearch-helper/src/version.js
  var require_version = __commonJS({
    "node_modules/algoliasearch-helper/src/version.js"(exports, module) {
      "use strict";
      module.exports = "3.21.0";
    }
  });

  // node_modules/algoliasearch-helper/src/algoliasearch.helper.js
  var require_algoliasearch_helper = __commonJS({
    "node_modules/algoliasearch-helper/src/algoliasearch.helper.js"(exports, module) {
      "use strict";
      var EventEmitter2 = require_events();
      var DerivedHelper = require_DerivedHelper();
      var escapeFacetValue = require_escapeFacetValue().escapeFacetValue;
      var inherits = require_inherits();
      var merge = require_merge();
      var objectHasKeys = require_objectHasKeys();
      var omit2 = require_omit();
      var RecommendParameters = require_RecommendParameters();
      var RecommendResults = require_RecommendResults();
      var requestBuilder = require_requestBuilder();
      var SearchParameters = require_SearchParameters();
      var SearchResults = require_SearchResults();
      var sortAndMergeRecommendations = require_sortAndMergeRecommendations();
      var version = require_version();
      function AlgoliaSearchHelper(client, index3, options, searchResultsOptions) {
        if (typeof client.addAlgoliaAgent === "function") {
          client.addAlgoliaAgent("JS Helper (" + version + ")");
        }
        this.setClient(client);
        var opts = options || {};
        opts.index = index3;
        this.state = SearchParameters.make(opts);
        this.recommendState = new RecommendParameters({
          params: opts.recommendState
        });
        this.lastResults = null;
        this.lastRecommendResults = null;
        this._queryId = 0;
        this._recommendQueryId = 0;
        this._lastQueryIdReceived = -1;
        this._lastRecommendQueryIdReceived = -1;
        this.derivedHelpers = [];
        this._currentNbQueries = 0;
        this._currentNbRecommendQueries = 0;
        this._searchResultsOptions = searchResultsOptions;
        this._recommendCache = {};
      }
      inherits(AlgoliaSearchHelper, EventEmitter2);
      AlgoliaSearchHelper.prototype.search = function() {
        this._search({ onlyWithDerivedHelpers: false });
        return this;
      };
      AlgoliaSearchHelper.prototype.searchOnlyWithDerivedHelpers = function() {
        this._search({ onlyWithDerivedHelpers: true });
        return this;
      };
      AlgoliaSearchHelper.prototype.recommend = function() {
        this._recommend();
        return this;
      };
      AlgoliaSearchHelper.prototype.getQuery = function() {
        var state = this.state;
        return requestBuilder._getHitsSearchParams(state);
      };
      AlgoliaSearchHelper.prototype.searchOnce = function(options, cb) {
        var tempState = !options ? this.state : this.state.setQueryParameters(options);
        var queries = requestBuilder._getQueries(tempState.index, tempState);
        var self2 = this;
        this._currentNbQueries++;
        this.emit("searchOnce", {
          state: tempState
        });
        if (cb) {
          this.client.search(queries).then(function(content) {
            self2._currentNbQueries--;
            if (self2._currentNbQueries === 0) {
              self2.emit("searchQueueEmpty");
            }
            cb(null, new SearchResults(tempState, content.results), tempState);
          }).catch(function(err) {
            self2._currentNbQueries--;
            if (self2._currentNbQueries === 0) {
              self2.emit("searchQueueEmpty");
            }
            cb(err, null, tempState);
          });
          return void 0;
        }
        return this.client.search(queries).then(
          function(content) {
            self2._currentNbQueries--;
            if (self2._currentNbQueries === 0) self2.emit("searchQueueEmpty");
            return {
              content: new SearchResults(tempState, content.results),
              state: tempState,
              _originalResponse: content
            };
          },
          function(e2) {
            self2._currentNbQueries--;
            if (self2._currentNbQueries === 0) self2.emit("searchQueueEmpty");
            throw e2;
          }
        );
      };
      AlgoliaSearchHelper.prototype.findAnswers = function(options) {
        console.warn("[algoliasearch-helper] answers is no longer supported");
        var state = this.state;
        var derivedHelper = this.derivedHelpers[0];
        if (!derivedHelper) {
          return Promise.resolve([]);
        }
        var derivedState = derivedHelper.getModifiedState(state);
        var data = merge(
          {
            attributesForPrediction: options.attributesForPrediction,
            nbHits: options.nbHits
          },
          {
            params: omit2(requestBuilder._getHitsSearchParams(derivedState), [
              "attributesToSnippet",
              "hitsPerPage",
              "restrictSearchableAttributes",
              "snippetEllipsisText"
            ])
          }
        );
        var errorMessage = "search for answers was called, but this client does not have a function client.initIndex(index).findAnswers";
        if (typeof this.client.initIndex !== "function") {
          throw new Error(errorMessage);
        }
        var index3 = this.client.initIndex(derivedState.index);
        if (typeof index3.findAnswers !== "function") {
          throw new Error(errorMessage);
        }
        return index3.findAnswers(derivedState.query, options.queryLanguages, data);
      };
      AlgoliaSearchHelper.prototype.searchForFacetValues = function(facet, query, maxFacetHits, userState) {
        var clientHasSFFV = typeof this.client.searchForFacetValues === "function";
        var clientHasInitIndex = typeof this.client.initIndex === "function";
        if (!clientHasSFFV && !clientHasInitIndex && typeof this.client.search !== "function") {
          throw new Error(
            "search for facet values (searchable) was called, but this client does not have a function client.searchForFacetValues or client.initIndex(index).searchForFacetValues"
          );
        }
        var state = this.state.setQueryParameters(userState || {});
        var isDisjunctive = state.isDisjunctiveFacet(facet);
        var algoliaQuery = requestBuilder.getSearchForFacetQuery(
          facet,
          query,
          maxFacetHits,
          state
        );
        this._currentNbQueries++;
        var self2 = this;
        var searchForFacetValuesPromise;
        if (clientHasSFFV) {
          searchForFacetValuesPromise = this.client.searchForFacetValues([
            { indexName: state.index, params: algoliaQuery }
          ]);
        } else if (clientHasInitIndex) {
          searchForFacetValuesPromise = this.client.initIndex(state.index).searchForFacetValues(algoliaQuery);
        } else {
          delete algoliaQuery.facetName;
          searchForFacetValuesPromise = this.client.search([
            {
              type: "facet",
              facet,
              indexName: state.index,
              params: algoliaQuery
            }
          ]).then(function processResponse(response) {
            return response.results[0];
          });
        }
        this.emit("searchForFacetValues", {
          state,
          facet,
          query
        });
        return searchForFacetValuesPromise.then(
          function addIsRefined(content) {
            self2._currentNbQueries--;
            if (self2._currentNbQueries === 0) self2.emit("searchQueueEmpty");
            content = Array.isArray(content) ? content[0] : content;
            content.facetHits.forEach(function(f2) {
              f2.escapedValue = escapeFacetValue(f2.value);
              f2.isRefined = isDisjunctive ? state.isDisjunctiveFacetRefined(facet, f2.escapedValue) : state.isFacetRefined(facet, f2.escapedValue);
            });
            return content;
          },
          function(e2) {
            self2._currentNbQueries--;
            if (self2._currentNbQueries === 0) self2.emit("searchQueueEmpty");
            throw e2;
          }
        );
      };
      AlgoliaSearchHelper.prototype.setQuery = function(q) {
        this._change({
          state: this.state.resetPage().setQuery(q),
          isPageReset: true
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.clearRefinements = function(name) {
        this._change({
          state: this.state.resetPage().clearRefinements(name),
          isPageReset: true
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.clearTags = function() {
        this._change({
          state: this.state.resetPage().clearTags(),
          isPageReset: true
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.addDisjunctiveFacetRefinement = function(facet, value) {
        this._change({
          state: this.state.resetPage().addDisjunctiveFacetRefinement(facet, value),
          isPageReset: true
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.addDisjunctiveRefine = function() {
        return this.addDisjunctiveFacetRefinement.apply(this, arguments);
      };
      AlgoliaSearchHelper.prototype.addHierarchicalFacetRefinement = function(facet, path) {
        this._change({
          state: this.state.resetPage().addHierarchicalFacetRefinement(facet, path),
          isPageReset: true
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.addNumericRefinement = function(attribute, operator, value) {
        this._change({
          state: this.state.resetPage().addNumericRefinement(attribute, operator, value),
          isPageReset: true
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.addFacetRefinement = function(facet, value) {
        this._change({
          state: this.state.resetPage().addFacetRefinement(facet, value),
          isPageReset: true
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.addRefine = function() {
        return this.addFacetRefinement.apply(this, arguments);
      };
      AlgoliaSearchHelper.prototype.addFacetExclusion = function(facet, value) {
        this._change({
          state: this.state.resetPage().addExcludeRefinement(facet, value),
          isPageReset: true
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.addExclude = function() {
        return this.addFacetExclusion.apply(this, arguments);
      };
      AlgoliaSearchHelper.prototype.addTag = function(tag) {
        this._change({
          state: this.state.resetPage().addTagRefinement(tag),
          isPageReset: true
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.addFrequentlyBoughtTogether = function(params) {
        this._recommendChange({
          state: this.recommendState.addFrequentlyBoughtTogether(params)
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.addRelatedProducts = function(params) {
        this._recommendChange({
          state: this.recommendState.addRelatedProducts(params)
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.addTrendingItems = function(params) {
        this._recommendChange({
          state: this.recommendState.addTrendingItems(params)
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.addTrendingFacets = function(params) {
        this._recommendChange({
          state: this.recommendState.addTrendingFacets(params)
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.addLookingSimilar = function(params) {
        this._recommendChange({
          state: this.recommendState.addLookingSimilar(params)
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.removeNumericRefinement = function(attribute, operator, value) {
        this._change({
          state: this.state.resetPage().removeNumericRefinement(attribute, operator, value),
          isPageReset: true
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.removeDisjunctiveFacetRefinement = function(facet, value) {
        this._change({
          state: this.state.resetPage().removeDisjunctiveFacetRefinement(facet, value),
          isPageReset: true
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.removeDisjunctiveRefine = function() {
        return this.removeDisjunctiveFacetRefinement.apply(this, arguments);
      };
      AlgoliaSearchHelper.prototype.removeHierarchicalFacetRefinement = function(facet) {
        this._change({
          state: this.state.resetPage().removeHierarchicalFacetRefinement(facet),
          isPageReset: true
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.removeFacetRefinement = function(facet, value) {
        this._change({
          state: this.state.resetPage().removeFacetRefinement(facet, value),
          isPageReset: true
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.removeRefine = function() {
        return this.removeFacetRefinement.apply(this, arguments);
      };
      AlgoliaSearchHelper.prototype.removeFacetExclusion = function(facet, value) {
        this._change({
          state: this.state.resetPage().removeExcludeRefinement(facet, value),
          isPageReset: true
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.removeExclude = function() {
        return this.removeFacetExclusion.apply(this, arguments);
      };
      AlgoliaSearchHelper.prototype.removeTag = function(tag) {
        this._change({
          state: this.state.resetPage().removeTagRefinement(tag),
          isPageReset: true
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.removeFrequentlyBoughtTogether = function(id2) {
        this._recommendChange({
          state: this.recommendState.removeParams(id2)
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.removeRelatedProducts = function(id2) {
        this._recommendChange({
          state: this.recommendState.removeParams(id2)
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.removeTrendingItems = function(id2) {
        this._recommendChange({
          state: this.recommendState.removeParams(id2)
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.removeTrendingFacets = function(id2) {
        this._recommendChange({
          state: this.recommendState.removeParams(id2)
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.removeLookingSimilar = function(id2) {
        this._recommendChange({
          state: this.recommendState.removeParams(id2)
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.toggleFacetExclusion = function(facet, value) {
        this._change({
          state: this.state.resetPage().toggleExcludeFacetRefinement(facet, value),
          isPageReset: true
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.toggleExclude = function() {
        return this.toggleFacetExclusion.apply(this, arguments);
      };
      AlgoliaSearchHelper.prototype.toggleRefinement = function(facet, value) {
        return this.toggleFacetRefinement(facet, value);
      };
      AlgoliaSearchHelper.prototype.toggleFacetRefinement = function(facet, value) {
        this._change({
          state: this.state.resetPage().toggleFacetRefinement(facet, value),
          isPageReset: true
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.toggleRefine = function() {
        return this.toggleFacetRefinement.apply(this, arguments);
      };
      AlgoliaSearchHelper.prototype.toggleTag = function(tag) {
        this._change({
          state: this.state.resetPage().toggleTagRefinement(tag),
          isPageReset: true
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.nextPage = function() {
        var page = this.state.page || 0;
        return this.setPage(page + 1);
      };
      AlgoliaSearchHelper.prototype.previousPage = function() {
        var page = this.state.page || 0;
        return this.setPage(page - 1);
      };
      function setCurrentPage(page) {
        if (page < 0) throw new Error("Page requested below 0.");
        this._change({
          state: this.state.setPage(page),
          isPageReset: false
        });
        return this;
      }
      AlgoliaSearchHelper.prototype.setCurrentPage = setCurrentPage;
      AlgoliaSearchHelper.prototype.setPage = setCurrentPage;
      AlgoliaSearchHelper.prototype.setIndex = function(name) {
        this._change({
          state: this.state.resetPage().setIndex(name),
          isPageReset: true
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.setQueryParameter = function(parameter, value) {
        this._change({
          state: this.state.resetPage().setQueryParameter(parameter, value),
          isPageReset: true
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.setState = function(newState) {
        this._change({
          state: SearchParameters.make(newState),
          isPageReset: false
        });
        return this;
      };
      AlgoliaSearchHelper.prototype.overrideStateWithoutTriggeringChangeEvent = function(newState) {
        this.state = new SearchParameters(newState);
        return this;
      };
      AlgoliaSearchHelper.prototype.hasRefinements = function(attribute) {
        if (objectHasKeys(this.state.getNumericRefinements(attribute))) {
          return true;
        } else if (this.state.isConjunctiveFacet(attribute)) {
          return this.state.isFacetRefined(attribute);
        } else if (this.state.isDisjunctiveFacet(attribute)) {
          return this.state.isDisjunctiveFacetRefined(attribute);
        } else if (this.state.isHierarchicalFacet(attribute)) {
          return this.state.isHierarchicalFacetRefined(attribute);
        }
        return false;
      };
      AlgoliaSearchHelper.prototype.isExcluded = function(facet, value) {
        return this.state.isExcludeRefined(facet, value);
      };
      AlgoliaSearchHelper.prototype.isDisjunctiveRefined = function(facet, value) {
        return this.state.isDisjunctiveFacetRefined(facet, value);
      };
      AlgoliaSearchHelper.prototype.hasTag = function(tag) {
        return this.state.isTagRefined(tag);
      };
      AlgoliaSearchHelper.prototype.isTagRefined = function() {
        return this.hasTagRefinements.apply(this, arguments);
      };
      AlgoliaSearchHelper.prototype.getIndex = function() {
        return this.state.index;
      };
      function getCurrentPage() {
        return this.state.page;
      }
      AlgoliaSearchHelper.prototype.getCurrentPage = getCurrentPage;
      AlgoliaSearchHelper.prototype.getPage = getCurrentPage;
      AlgoliaSearchHelper.prototype.getTags = function() {
        return this.state.tagRefinements;
      };
      AlgoliaSearchHelper.prototype.getRefinements = function(facetName) {
        var refinements = [];
        if (this.state.isConjunctiveFacet(facetName)) {
          var conjRefinements = this.state.getConjunctiveRefinements(facetName);
          conjRefinements.forEach(function(r2) {
            refinements.push({
              value: r2,
              type: "conjunctive"
            });
          });
          var excludeRefinements = this.state.getExcludeRefinements(facetName);
          excludeRefinements.forEach(function(r2) {
            refinements.push({
              value: r2,
              type: "exclude"
            });
          });
        } else if (this.state.isDisjunctiveFacet(facetName)) {
          var disjunctiveRefinements = this.state.getDisjunctiveRefinements(facetName);
          disjunctiveRefinements.forEach(function(r2) {
            refinements.push({
              value: r2,
              type: "disjunctive"
            });
          });
        }
        var numericRefinements = this.state.getNumericRefinements(facetName);
        Object.keys(numericRefinements).forEach(function(operator) {
          var value = numericRefinements[operator];
          refinements.push({
            value,
            operator,
            type: "numeric"
          });
        });
        return refinements;
      };
      AlgoliaSearchHelper.prototype.getNumericRefinement = function(attribute, operator) {
        return this.state.getNumericRefinement(attribute, operator);
      };
      AlgoliaSearchHelper.prototype.getHierarchicalFacetBreadcrumb = function(facetName) {
        return this.state.getHierarchicalFacetBreadcrumb(facetName);
      };
      AlgoliaSearchHelper.prototype._search = function(options) {
        var state = this.state;
        var states = [];
        var mainQueries = [];
        if (!options.onlyWithDerivedHelpers) {
          mainQueries = requestBuilder._getQueries(state.index, state);
          states.push({
            state,
            queriesCount: mainQueries.length,
            helper: this
          });
          this.emit("search", {
            state,
            results: this.lastResults
          });
        }
        var derivedQueries = this.derivedHelpers.map(function(derivedHelper) {
          var derivedState = derivedHelper.getModifiedState(state);
          var derivedStateQueries = derivedState.index ? requestBuilder._getQueries(derivedState.index, derivedState) : [];
          states.push({
            state: derivedState,
            queriesCount: derivedStateQueries.length,
            helper: derivedHelper
          });
          derivedHelper.emit("search", {
            state: derivedState,
            results: derivedHelper.lastResults
          });
          return derivedStateQueries;
        });
        var queries = Array.prototype.concat.apply(mainQueries, derivedQueries);
        var queryId = this._queryId++;
        this._currentNbQueries++;
        if (!queries.length) {
          return Promise.resolve({ results: [] }).then(
            this._dispatchAlgoliaResponse.bind(this, states, queryId)
          );
        }
        try {
          this.client.search(queries).then(this._dispatchAlgoliaResponse.bind(this, states, queryId)).catch(this._dispatchAlgoliaError.bind(this, queryId));
        } catch (error) {
          this.emit("error", {
            error
          });
        }
        return void 0;
      };
      AlgoliaSearchHelper.prototype._recommend = function() {
        var searchState = this.state;
        var recommendState = this.recommendState;
        var index3 = this.getIndex();
        var states = [{ state: recommendState, index: index3, helper: this }];
        var ids = recommendState.params.map(function(param) {
          return param.$$id;
        });
        this.emit("fetch", {
          recommend: {
            state: recommendState,
            results: this.lastRecommendResults
          }
        });
        var cache = this._recommendCache;
        var derivedQueries = this.derivedHelpers.map(function(derivedHelper) {
          var derivedIndex = derivedHelper.getModifiedState(searchState).index;
          if (!derivedIndex) {
            return [];
          }
          var derivedState = derivedHelper.getModifiedRecommendState(
            new RecommendParameters()
          );
          states.push({
            state: derivedState,
            index: derivedIndex,
            helper: derivedHelper
          });
          ids = Array.prototype.concat.apply(
            ids,
            derivedState.params.map(function(param) {
              return param.$$id;
            })
          );
          derivedHelper.emit("fetch", {
            recommend: {
              state: derivedState,
              results: derivedHelper.lastRecommendResults
            }
          });
          return derivedState._buildQueries(derivedIndex, cache);
        });
        var queries = Array.prototype.concat.apply(
          this.recommendState._buildQueries(index3, cache),
          derivedQueries
        );
        if (queries.length === 0) {
          return;
        }
        if (queries.length > 0 && typeof this.client.getRecommendations === "undefined") {
          console.warn(
            "Please update algoliasearch/lite to the latest version in order to use recommend widgets."
          );
          return;
        }
        var queryId = this._recommendQueryId++;
        this._currentNbRecommendQueries++;
        try {
          this.client.getRecommendations(queries).then(this._dispatchRecommendResponse.bind(this, queryId, states, ids)).catch(this._dispatchRecommendError.bind(this, queryId));
        } catch (error) {
          this.emit("error", {
            error
          });
        }
        return;
      };
      AlgoliaSearchHelper.prototype._dispatchAlgoliaResponse = function(states, queryId, content) {
        var self2 = this;
        if (queryId < this._lastQueryIdReceived) {
          return;
        }
        this._currentNbQueries -= queryId - this._lastQueryIdReceived;
        this._lastQueryIdReceived = queryId;
        if (this._currentNbQueries === 0) this.emit("searchQueueEmpty");
        var results = content.results.slice();
        states.forEach(function(s2) {
          var state = s2.state;
          var queriesCount = s2.queriesCount;
          var helper = s2.helper;
          var specificResults = results.splice(0, queriesCount);
          if (!state.index) {
            helper.emit("result", {
              results: null,
              state
            });
            return;
          }
          helper.lastResults = new SearchResults(
            state,
            specificResults,
            self2._searchResultsOptions
          );
          helper.emit("result", {
            results: helper.lastResults,
            state
          });
        });
      };
      AlgoliaSearchHelper.prototype._dispatchRecommendResponse = function(queryId, states, ids, content) {
        if (queryId < this._lastRecommendQueryIdReceived) {
          return;
        }
        this._currentNbRecommendQueries -= queryId - this._lastRecommendQueryIdReceived;
        this._lastRecommendQueryIdReceived = queryId;
        if (this._currentNbRecommendQueries === 0) this.emit("recommendQueueEmpty");
        var cache = this._recommendCache;
        var idsMap = {};
        ids.filter(function(id2) {
          return cache[id2] === void 0;
        }).forEach(function(id2, index3) {
          if (!idsMap[id2]) idsMap[id2] = [];
          idsMap[id2].push(index3);
        });
        Object.keys(idsMap).forEach(function(id2) {
          var indices = idsMap[id2];
          var firstResult = content.results[indices[0]];
          if (indices.length === 1) {
            cache[id2] = firstResult;
            return;
          }
          cache[id2] = Object.assign({}, firstResult, {
            hits: sortAndMergeRecommendations(
              indices.map(function(idx) {
                return content.results[idx].hits;
              })
            )
          });
        });
        var results = {};
        ids.forEach(function(id2) {
          results[id2] = cache[id2];
        });
        states.forEach(function(s2) {
          var state = s2.state;
          var helper = s2.helper;
          if (!s2.index) {
            helper.emit("recommend:result", {
              results: null,
              state
            });
            return;
          }
          helper.lastRecommendResults = new RecommendResults(state, results);
          helper.emit("recommend:result", {
            recommend: {
              results: helper.lastRecommendResults,
              state
            }
          });
        });
      };
      AlgoliaSearchHelper.prototype._dispatchAlgoliaError = function(queryId, error) {
        if (queryId < this._lastQueryIdReceived) {
          return;
        }
        this._currentNbQueries -= queryId - this._lastQueryIdReceived;
        this._lastQueryIdReceived = queryId;
        this.emit("error", {
          error
        });
        if (this._currentNbQueries === 0) this.emit("searchQueueEmpty");
      };
      AlgoliaSearchHelper.prototype._dispatchRecommendError = function(queryId, error) {
        if (queryId < this._lastRecommendQueryIdReceived) {
          return;
        }
        this._currentNbRecommendQueries -= queryId - this._lastRecommendQueryIdReceived;
        this._lastRecommendQueryIdReceived = queryId;
        this.emit("error", {
          error
        });
        if (this._currentNbRecommendQueries === 0) this.emit("recommendQueueEmpty");
      };
      AlgoliaSearchHelper.prototype.containsRefinement = function(query, facetFilters, numericFilters, tagFilters) {
        return query || facetFilters.length !== 0 || numericFilters.length !== 0 || tagFilters.length !== 0;
      };
      AlgoliaSearchHelper.prototype._hasDisjunctiveRefinements = function(facet) {
        return this.state.disjunctiveRefinements[facet] && this.state.disjunctiveRefinements[facet].length > 0;
      };
      AlgoliaSearchHelper.prototype._change = function(event) {
        var state = event.state;
        var isPageReset = event.isPageReset;
        if (state !== this.state) {
          this.state = state;
          this.emit("change", {
            state: this.state,
            results: this.lastResults,
            isPageReset
          });
        }
      };
      AlgoliaSearchHelper.prototype._recommendChange = function(event) {
        var state = event.state;
        if (state !== this.recommendState) {
          this.recommendState = state;
          this.emit("recommend:change", {
            search: {
              results: this.lastResults,
              state: this.state
            },
            recommend: {
              results: this.lastRecommendResults,
              state: this.recommendState
            }
          });
        }
      };
      AlgoliaSearchHelper.prototype.clearCache = function() {
        if (this.client.clearCache) this.client.clearCache();
        return this;
      };
      AlgoliaSearchHelper.prototype.setClient = function(newClient) {
        if (this.client === newClient) return this;
        if (typeof newClient.addAlgoliaAgent === "function") {
          newClient.addAlgoliaAgent("JS Helper (" + version + ")");
        }
        this.client = newClient;
        return this;
      };
      AlgoliaSearchHelper.prototype.getClient = function() {
        return this.client;
      };
      AlgoliaSearchHelper.prototype.derive = function(fn, recommendFn) {
        var derivedHelper = new DerivedHelper(this, fn, recommendFn);
        this.derivedHelpers.push(derivedHelper);
        return derivedHelper;
      };
      AlgoliaSearchHelper.prototype.detachDerivedHelper = function(derivedHelper) {
        var pos = this.derivedHelpers.indexOf(derivedHelper);
        if (pos === -1) throw new Error("Derived helper already detached");
        this.derivedHelpers.splice(pos, 1);
      };
      AlgoliaSearchHelper.prototype.hasPendingRequests = function() {
        return this._currentNbQueries > 0;
      };
      module.exports = AlgoliaSearchHelper;
    }
  });

  // node_modules/algoliasearch-helper/index.js
  var require_algoliasearch_helper2 = __commonJS({
    "node_modules/algoliasearch-helper/index.js"(exports, module) {
      "use strict";
      var AlgoliaSearchHelper = require_algoliasearch_helper();
      var RecommendParameters = require_RecommendParameters();
      var RecommendResults = require_RecommendResults();
      var SearchParameters = require_SearchParameters();
      var SearchResults = require_SearchResults();
      function algoliasearchHelper3(client, index3, opts, searchResultsOptions) {
        return new AlgoliaSearchHelper(client, index3, opts, searchResultsOptions);
      }
      algoliasearchHelper3.version = require_version();
      algoliasearchHelper3.AlgoliaSearchHelper = AlgoliaSearchHelper;
      algoliasearchHelper3.SearchParameters = SearchParameters;
      algoliasearchHelper3.RecommendParameters = RecommendParameters;
      algoliasearchHelper3.SearchResults = SearchResults;
      algoliasearchHelper3.RecommendResults = RecommendResults;
      module.exports = algoliasearchHelper3;
    }
  });

  // node_modules/qs/lib/formats.js
  var require_formats = __commonJS({
    "node_modules/qs/lib/formats.js"(exports, module) {
      "use strict";
      var replace = String.prototype.replace;
      var percentTwenties = /%20/g;
      var Format = {
        RFC1738: "RFC1738",
        RFC3986: "RFC3986"
      };
      module.exports = {
        "default": Format.RFC3986,
        formatters: {
          RFC1738: function(value) {
            return replace.call(value, percentTwenties, "+");
          },
          RFC3986: function(value) {
            return String(value);
          }
        },
        RFC1738: Format.RFC1738,
        RFC3986: Format.RFC3986
      };
    }
  });

  // node_modules/qs/lib/utils.js
  var require_utils = __commonJS({
    "node_modules/qs/lib/utils.js"(exports, module) {
      "use strict";
      var formats = require_formats();
      var has = Object.prototype.hasOwnProperty;
      var isArray = Array.isArray;
      var hexTable = function() {
        var array = [];
        for (var i2 = 0; i2 < 256; ++i2) {
          array.push("%" + ((i2 < 16 ? "0" : "") + i2.toString(16)).toUpperCase());
        }
        return array;
      }();
      var compactQueue = function compactQueue2(queue) {
        while (queue.length > 1) {
          var item3 = queue.pop();
          var obj = item3.obj[item3.prop];
          if (isArray(obj)) {
            var compacted = [];
            for (var j2 = 0; j2 < obj.length; ++j2) {
              if (typeof obj[j2] !== "undefined") {
                compacted.push(obj[j2]);
              }
            }
            item3.obj[item3.prop] = compacted;
          }
        }
      };
      var arrayToObject = function arrayToObject2(source, options) {
        var obj = options && options.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
        for (var i2 = 0; i2 < source.length; ++i2) {
          if (typeof source[i2] !== "undefined") {
            obj[i2] = source[i2];
          }
        }
        return obj;
      };
      var merge = function merge2(target, source, options) {
        if (!source) {
          return target;
        }
        if (typeof source !== "object") {
          if (isArray(target)) {
            target.push(source);
          } else if (target && typeof target === "object") {
            if (options && (options.plainObjects || options.allowPrototypes) || !has.call(Object.prototype, source)) {
              target[source] = true;
            }
          } else {
            return [target, source];
          }
          return target;
        }
        if (!target || typeof target !== "object") {
          return [target].concat(source);
        }
        var mergeTarget = target;
        if (isArray(target) && !isArray(source)) {
          mergeTarget = arrayToObject(target, options);
        }
        if (isArray(target) && isArray(source)) {
          source.forEach(function(item3, i2) {
            if (has.call(target, i2)) {
              var targetItem = target[i2];
              if (targetItem && typeof targetItem === "object" && item3 && typeof item3 === "object") {
                target[i2] = merge2(targetItem, item3, options);
              } else {
                target.push(item3);
              }
            } else {
              target[i2] = item3;
            }
          });
          return target;
        }
        return Object.keys(source).reduce(function(acc, key2) {
          var value = source[key2];
          if (has.call(acc, key2)) {
            acc[key2] = merge2(acc[key2], value, options);
          } else {
            acc[key2] = value;
          }
          return acc;
        }, mergeTarget);
      };
      var assign = function assignSingleSource(target, source) {
        return Object.keys(source).reduce(function(acc, key2) {
          acc[key2] = source[key2];
          return acc;
        }, target);
      };
      var decode = function(str, decoder, charset) {
        var strWithoutPlus = str.replace(/\+/g, " ");
        if (charset === "iso-8859-1") {
          return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
        }
        try {
          return decodeURIComponent(strWithoutPlus);
        } catch (e2) {
          return strWithoutPlus;
        }
      };
      var encode = function encode2(str, defaultEncoder, charset, kind, format) {
        if (str.length === 0) {
          return str;
        }
        var string = str;
        if (typeof str === "symbol") {
          string = Symbol.prototype.toString.call(str);
        } else if (typeof str !== "string") {
          string = String(str);
        }
        if (charset === "iso-8859-1") {
          return escape(string).replace(/%u[0-9a-f]{4}/gi, function($0) {
            return "%26%23" + parseInt($0.slice(2), 16) + "%3B";
          });
        }
        var out = "";
        for (var i2 = 0; i2 < string.length; ++i2) {
          var c2 = string.charCodeAt(i2);
          if (c2 === 45 || c2 === 46 || c2 === 95 || c2 === 126 || c2 >= 48 && c2 <= 57 || c2 >= 65 && c2 <= 90 || c2 >= 97 && c2 <= 122 || format === formats.RFC1738 && (c2 === 40 || c2 === 41)) {
            out += string.charAt(i2);
            continue;
          }
          if (c2 < 128) {
            out = out + hexTable[c2];
            continue;
          }
          if (c2 < 2048) {
            out = out + (hexTable[192 | c2 >> 6] + hexTable[128 | c2 & 63]);
            continue;
          }
          if (c2 < 55296 || c2 >= 57344) {
            out = out + (hexTable[224 | c2 >> 12] + hexTable[128 | c2 >> 6 & 63] + hexTable[128 | c2 & 63]);
            continue;
          }
          i2 += 1;
          c2 = 65536 + ((c2 & 1023) << 10 | string.charCodeAt(i2) & 1023);
          out += hexTable[240 | c2 >> 18] + hexTable[128 | c2 >> 12 & 63] + hexTable[128 | c2 >> 6 & 63] + hexTable[128 | c2 & 63];
        }
        return out;
      };
      var compact = function compact2(value) {
        var queue = [{ obj: { o: value }, prop: "o" }];
        var refs = [];
        for (var i2 = 0; i2 < queue.length; ++i2) {
          var item3 = queue[i2];
          var obj = item3.obj[item3.prop];
          var keys2 = Object.keys(obj);
          for (var j2 = 0; j2 < keys2.length; ++j2) {
            var key2 = keys2[j2];
            var val = obj[key2];
            if (typeof val === "object" && val !== null && refs.indexOf(val) === -1) {
              queue.push({ obj, prop: key2 });
              refs.push(val);
            }
          }
        }
        compactQueue(queue);
        return value;
      };
      var isRegExp = function isRegExp2(obj) {
        return Object.prototype.toString.call(obj) === "[object RegExp]";
      };
      var isBuffer = function isBuffer2(obj) {
        if (!obj || typeof obj !== "object") {
          return false;
        }
        return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
      };
      var combine = function combine2(a2, b2) {
        return [].concat(a2, b2);
      };
      var maybeMap = function maybeMap2(val, fn) {
        if (isArray(val)) {
          var mapped = [];
          for (var i2 = 0; i2 < val.length; i2 += 1) {
            mapped.push(fn(val[i2]));
          }
          return mapped;
        }
        return fn(val);
      };
      module.exports = {
        arrayToObject,
        assign,
        combine,
        compact,
        decode,
        encode,
        isBuffer,
        isRegExp,
        maybeMap,
        merge
      };
    }
  });

  // node_modules/qs/lib/stringify.js
  var require_stringify = __commonJS({
    "node_modules/qs/lib/stringify.js"(exports, module) {
      "use strict";
      var utils = require_utils();
      var formats = require_formats();
      var has = Object.prototype.hasOwnProperty;
      var arrayPrefixGenerators = {
        brackets: function brackets(prefix) {
          return prefix + "[]";
        },
        comma: "comma",
        indices: function indices(prefix, key2) {
          return prefix + "[" + key2 + "]";
        },
        repeat: function repeat(prefix) {
          return prefix;
        }
      };
      var isArray = Array.isArray;
      var split = String.prototype.split;
      var push = Array.prototype.push;
      var pushToArray = function(arr, valueOrArray) {
        push.apply(arr, isArray(valueOrArray) ? valueOrArray : [valueOrArray]);
      };
      var toISO = Date.prototype.toISOString;
      var defaultFormat = formats["default"];
      var defaults = {
        addQueryPrefix: false,
        allowDots: false,
        charset: "utf-8",
        charsetSentinel: false,
        delimiter: "&",
        encode: true,
        encoder: utils.encode,
        encodeValuesOnly: false,
        format: defaultFormat,
        formatter: formats.formatters[defaultFormat],
        // deprecated
        indices: false,
        serializeDate: function serializeDate(date) {
          return toISO.call(date);
        },
        skipNulls: false,
        strictNullHandling: false
      };
      var isNonNullishPrimitive = function isNonNullishPrimitive2(v2) {
        return typeof v2 === "string" || typeof v2 === "number" || typeof v2 === "boolean" || typeof v2 === "symbol" || typeof v2 === "bigint";
      };
      var stringify = function stringify2(object, prefix, generateArrayPrefix, strictNullHandling, skipNulls, encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset) {
        var obj = object;
        if (typeof filter === "function") {
          obj = filter(prefix, obj);
        } else if (obj instanceof Date) {
          obj = serializeDate(obj);
        } else if (generateArrayPrefix === "comma" && isArray(obj)) {
          obj = utils.maybeMap(obj, function(value2) {
            if (value2 instanceof Date) {
              return serializeDate(value2);
            }
            return value2;
          });
        }
        if (obj === null) {
          if (strictNullHandling) {
            return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset, "key", format) : prefix;
          }
          obj = "";
        }
        if (isNonNullishPrimitive(obj) || utils.isBuffer(obj)) {
          if (encoder) {
            var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, "key", format);
            if (generateArrayPrefix === "comma" && encodeValuesOnly) {
              var valuesArray = split.call(String(obj), ",");
              var valuesJoined = "";
              for (var i2 = 0; i2 < valuesArray.length; ++i2) {
                valuesJoined += (i2 === 0 ? "" : ",") + formatter(encoder(valuesArray[i2], defaults.encoder, charset, "value", format));
              }
              return [formatter(keyValue) + "=" + valuesJoined];
            }
            return [formatter(keyValue) + "=" + formatter(encoder(obj, defaults.encoder, charset, "value", format))];
          }
          return [formatter(prefix) + "=" + formatter(String(obj))];
        }
        var values = [];
        if (typeof obj === "undefined") {
          return values;
        }
        var objKeys;
        if (generateArrayPrefix === "comma" && isArray(obj)) {
          objKeys = [{ value: obj.length > 0 ? obj.join(",") || null : void 0 }];
        } else if (isArray(filter)) {
          objKeys = filter;
        } else {
          var keys2 = Object.keys(obj);
          objKeys = sort ? keys2.sort(sort) : keys2;
        }
        for (var j2 = 0; j2 < objKeys.length; ++j2) {
          var key2 = objKeys[j2];
          var value = typeof key2 === "object" && typeof key2.value !== "undefined" ? key2.value : obj[key2];
          if (skipNulls && value === null) {
            continue;
          }
          var keyPrefix = isArray(obj) ? typeof generateArrayPrefix === "function" ? generateArrayPrefix(prefix, key2) : prefix : prefix + (allowDots ? "." + key2 : "[" + key2 + "]");
          pushToArray(values, stringify2(
            value,
            keyPrefix,
            generateArrayPrefix,
            strictNullHandling,
            skipNulls,
            encoder,
            filter,
            sort,
            allowDots,
            serializeDate,
            format,
            formatter,
            encodeValuesOnly,
            charset
          ));
        }
        return values;
      };
      var normalizeStringifyOptions = function normalizeStringifyOptions2(opts) {
        if (!opts) {
          return defaults;
        }
        if (opts.encoder !== null && typeof opts.encoder !== "undefined" && typeof opts.encoder !== "function") {
          throw new TypeError("Encoder has to be a function.");
        }
        var charset = opts.charset || defaults.charset;
        if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
          throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
        }
        var format = formats["default"];
        if (typeof opts.format !== "undefined") {
          if (!has.call(formats.formatters, opts.format)) {
            throw new TypeError("Unknown format option provided.");
          }
          format = opts.format;
        }
        var formatter = formats.formatters[format];
        var filter = defaults.filter;
        if (typeof opts.filter === "function" || isArray(opts.filter)) {
          filter = opts.filter;
        }
        return {
          addQueryPrefix: typeof opts.addQueryPrefix === "boolean" ? opts.addQueryPrefix : defaults.addQueryPrefix,
          allowDots: typeof opts.allowDots === "undefined" ? defaults.allowDots : !!opts.allowDots,
          charset,
          charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
          delimiter: typeof opts.delimiter === "undefined" ? defaults.delimiter : opts.delimiter,
          encode: typeof opts.encode === "boolean" ? opts.encode : defaults.encode,
          encoder: typeof opts.encoder === "function" ? opts.encoder : defaults.encoder,
          encodeValuesOnly: typeof opts.encodeValuesOnly === "boolean" ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
          filter,
          format,
          formatter,
          serializeDate: typeof opts.serializeDate === "function" ? opts.serializeDate : defaults.serializeDate,
          skipNulls: typeof opts.skipNulls === "boolean" ? opts.skipNulls : defaults.skipNulls,
          sort: typeof opts.sort === "function" ? opts.sort : null,
          strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling
        };
      };
      module.exports = function(object, opts) {
        var obj = object;
        var options = normalizeStringifyOptions(opts);
        var objKeys;
        var filter;
        if (typeof options.filter === "function") {
          filter = options.filter;
          obj = filter("", obj);
        } else if (isArray(options.filter)) {
          filter = options.filter;
          objKeys = filter;
        }
        var keys2 = [];
        if (typeof obj !== "object" || obj === null) {
          return "";
        }
        var arrayFormat;
        if (opts && opts.arrayFormat in arrayPrefixGenerators) {
          arrayFormat = opts.arrayFormat;
        } else if (opts && "indices" in opts) {
          arrayFormat = opts.indices ? "indices" : "repeat";
        } else {
          arrayFormat = "indices";
        }
        var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];
        if (!objKeys) {
          objKeys = Object.keys(obj);
        }
        if (options.sort) {
          objKeys.sort(options.sort);
        }
        for (var i2 = 0; i2 < objKeys.length; ++i2) {
          var key2 = objKeys[i2];
          if (options.skipNulls && obj[key2] === null) {
            continue;
          }
          pushToArray(keys2, stringify(
            obj[key2],
            key2,
            generateArrayPrefix,
            options.strictNullHandling,
            options.skipNulls,
            options.encode ? options.encoder : null,
            options.filter,
            options.sort,
            options.allowDots,
            options.serializeDate,
            options.format,
            options.formatter,
            options.encodeValuesOnly,
            options.charset
          ));
        }
        var joined = keys2.join(options.delimiter);
        var prefix = options.addQueryPrefix === true ? "?" : "";
        if (options.charsetSentinel) {
          if (options.charset === "iso-8859-1") {
            prefix += "utf8=%26%2310003%3B&";
          } else {
            prefix += "utf8=%E2%9C%93&";
          }
        }
        return joined.length > 0 ? prefix + joined : "";
      };
    }
  });

  // node_modules/qs/lib/parse.js
  var require_parse = __commonJS({
    "node_modules/qs/lib/parse.js"(exports, module) {
      "use strict";
      var utils = require_utils();
      var has = Object.prototype.hasOwnProperty;
      var isArray = Array.isArray;
      var defaults = {
        allowDots: false,
        allowPrototypes: false,
        arrayLimit: 20,
        charset: "utf-8",
        charsetSentinel: false,
        comma: false,
        decoder: utils.decode,
        delimiter: "&",
        depth: 5,
        ignoreQueryPrefix: false,
        interpretNumericEntities: false,
        parameterLimit: 1e3,
        parseArrays: true,
        plainObjects: false,
        strictNullHandling: false
      };
      var interpretNumericEntities = function(str) {
        return str.replace(/&#(\d+);/g, function($0, numberStr) {
          return String.fromCharCode(parseInt(numberStr, 10));
        });
      };
      var parseArrayValue = function(val, options) {
        if (val && typeof val === "string" && options.comma && val.indexOf(",") > -1) {
          return val.split(",");
        }
        return val;
      };
      var isoSentinel = "utf8=%26%2310003%3B";
      var charsetSentinel = "utf8=%E2%9C%93";
      var parseValues = function parseQueryStringValues(str, options) {
        var obj = {};
        var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, "") : str;
        var limit = options.parameterLimit === Infinity ? void 0 : options.parameterLimit;
        var parts = cleanStr.split(options.delimiter, limit);
        var skipIndex = -1;
        var i2;
        var charset = options.charset;
        if (options.charsetSentinel) {
          for (i2 = 0; i2 < parts.length; ++i2) {
            if (parts[i2].indexOf("utf8=") === 0) {
              if (parts[i2] === charsetSentinel) {
                charset = "utf-8";
              } else if (parts[i2] === isoSentinel) {
                charset = "iso-8859-1";
              }
              skipIndex = i2;
              i2 = parts.length;
            }
          }
        }
        for (i2 = 0; i2 < parts.length; ++i2) {
          if (i2 === skipIndex) {
            continue;
          }
          var part = parts[i2];
          var bracketEqualsPos = part.indexOf("]=");
          var pos = bracketEqualsPos === -1 ? part.indexOf("=") : bracketEqualsPos + 1;
          var key2, val;
          if (pos === -1) {
            key2 = options.decoder(part, defaults.decoder, charset, "key");
            val = options.strictNullHandling ? null : "";
          } else {
            key2 = options.decoder(part.slice(0, pos), defaults.decoder, charset, "key");
            val = utils.maybeMap(
              parseArrayValue(part.slice(pos + 1), options),
              function(encodedVal) {
                return options.decoder(encodedVal, defaults.decoder, charset, "value");
              }
            );
          }
          if (val && options.interpretNumericEntities && charset === "iso-8859-1") {
            val = interpretNumericEntities(val);
          }
          if (part.indexOf("[]=") > -1) {
            val = isArray(val) ? [val] : val;
          }
          if (has.call(obj, key2)) {
            obj[key2] = utils.combine(obj[key2], val);
          } else {
            obj[key2] = val;
          }
        }
        return obj;
      };
      var parseObject = function(chain, val, options, valuesParsed) {
        var leaf = valuesParsed ? val : parseArrayValue(val, options);
        for (var i2 = chain.length - 1; i2 >= 0; --i2) {
          var obj;
          var root = chain[i2];
          if (root === "[]" && options.parseArrays) {
            obj = [].concat(leaf);
          } else {
            obj = options.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
            var cleanRoot = root.charAt(0) === "[" && root.charAt(root.length - 1) === "]" ? root.slice(1, -1) : root;
            var index3 = parseInt(cleanRoot, 10);
            if (!options.parseArrays && cleanRoot === "") {
              obj = { 0: leaf };
            } else if (!isNaN(index3) && root !== cleanRoot && String(index3) === cleanRoot && index3 >= 0 && (options.parseArrays && index3 <= options.arrayLimit)) {
              obj = [];
              obj[index3] = leaf;
            } else if (cleanRoot !== "__proto__") {
              obj[cleanRoot] = leaf;
            }
          }
          leaf = obj;
        }
        return leaf;
      };
      var parseKeys = function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
        if (!givenKey) {
          return;
        }
        var key2 = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, "[$1]") : givenKey;
        var brackets = /(\[[^[\]]*])/;
        var child = /(\[[^[\]]*])/g;
        var segment = options.depth > 0 && brackets.exec(key2);
        var parent = segment ? key2.slice(0, segment.index) : key2;
        var keys2 = [];
        if (parent) {
          if (!options.plainObjects && has.call(Object.prototype, parent)) {
            if (!options.allowPrototypes) {
              return;
            }
          }
          keys2.push(parent);
        }
        var i2 = 0;
        while (options.depth > 0 && (segment = child.exec(key2)) !== null && i2 < options.depth) {
          i2 += 1;
          if (!options.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1))) {
            if (!options.allowPrototypes) {
              return;
            }
          }
          keys2.push(segment[1]);
        }
        if (segment) {
          keys2.push("[" + key2.slice(segment.index) + "]");
        }
        return parseObject(keys2, val, options, valuesParsed);
      };
      var normalizeParseOptions = function normalizeParseOptions2(opts) {
        if (!opts) {
          return defaults;
        }
        if (opts.decoder !== null && opts.decoder !== void 0 && typeof opts.decoder !== "function") {
          throw new TypeError("Decoder has to be a function.");
        }
        if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
          throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
        }
        var charset = typeof opts.charset === "undefined" ? defaults.charset : opts.charset;
        return {
          allowDots: typeof opts.allowDots === "undefined" ? defaults.allowDots : !!opts.allowDots,
          allowPrototypes: typeof opts.allowPrototypes === "boolean" ? opts.allowPrototypes : defaults.allowPrototypes,
          arrayLimit: typeof opts.arrayLimit === "number" ? opts.arrayLimit : defaults.arrayLimit,
          charset,
          charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
          comma: typeof opts.comma === "boolean" ? opts.comma : defaults.comma,
          decoder: typeof opts.decoder === "function" ? opts.decoder : defaults.decoder,
          delimiter: typeof opts.delimiter === "string" || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
          // eslint-disable-next-line no-implicit-coercion, no-extra-parens
          depth: typeof opts.depth === "number" || opts.depth === false ? +opts.depth : defaults.depth,
          ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
          interpretNumericEntities: typeof opts.interpretNumericEntities === "boolean" ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
          parameterLimit: typeof opts.parameterLimit === "number" ? opts.parameterLimit : defaults.parameterLimit,
          parseArrays: opts.parseArrays !== false,
          plainObjects: typeof opts.plainObjects === "boolean" ? opts.plainObjects : defaults.plainObjects,
          strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling
        };
      };
      module.exports = function(str, opts) {
        var options = normalizeParseOptions(opts);
        if (str === "" || str === null || typeof str === "undefined") {
          return options.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
        }
        var tempObj = typeof str === "string" ? parseValues(str, options) : str;
        var obj = options.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
        var keys2 = Object.keys(tempObj);
        for (var i2 = 0; i2 < keys2.length; ++i2) {
          var key2 = keys2[i2];
          var newObj = parseKeys(key2, tempObj[key2], options, typeof str === "string");
          obj = utils.merge(obj, newObj, options);
        }
        return utils.compact(obj);
      };
    }
  });

  // node_modules/qs/lib/index.js
  var require_lib = __commonJS({
    "node_modules/qs/lib/index.js"(exports, module) {
      "use strict";
      var stringify = require_stringify();
      var parse = require_parse();
      var formats = require_formats();
      module.exports = {
        formats,
        parse,
        stringify
      };
    }
  });

  // ../../node_modules/hogan.js/lib/compiler.js
  var require_compiler = __commonJS({
    "../../node_modules/hogan.js/lib/compiler.js"(exports) {
      (function(Hogan2) {
        var rIsWhitespace = /\S/, rQuot = /\"/g, rNewline = /\n/g, rCr = /\r/g, rSlash = /\\/g, rLineSep = /\u2028/, rParagraphSep = /\u2029/;
        Hogan2.tags = {
          "#": 1,
          "^": 2,
          "<": 3,
          "$": 4,
          "/": 5,
          "!": 6,
          ">": 7,
          "=": 8,
          "_v": 9,
          "{": 10,
          "&": 11,
          "_t": 12
        };
        Hogan2.scan = function scan(text, delimiters) {
          var len = text.length, IN_TEXT = 0, IN_TAG_TYPE = 1, IN_TAG = 2, state = IN_TEXT, tagType = null, tag = null, buf = "", tokens = [], seenTag = false, i2 = 0, lineStart = 0, otag = "{{", ctag = "}}";
          function addBuf() {
            if (buf.length > 0) {
              tokens.push({ tag: "_t", text: new String(buf) });
              buf = "";
            }
          }
          function lineIsWhitespace() {
            var isAllWhitespace = true;
            for (var j2 = lineStart; j2 < tokens.length; j2++) {
              isAllWhitespace = Hogan2.tags[tokens[j2].tag] < Hogan2.tags["_v"] || tokens[j2].tag == "_t" && tokens[j2].text.match(rIsWhitespace) === null;
              if (!isAllWhitespace) {
                return false;
              }
            }
            return isAllWhitespace;
          }
          function filterLine(haveSeenTag, noNewLine) {
            addBuf();
            if (haveSeenTag && lineIsWhitespace()) {
              for (var j2 = lineStart, next; j2 < tokens.length; j2++) {
                if (tokens[j2].text) {
                  if ((next = tokens[j2 + 1]) && next.tag == ">") {
                    next.indent = tokens[j2].text.toString();
                  }
                  tokens.splice(j2, 1);
                }
              }
            } else if (!noNewLine) {
              tokens.push({ tag: "\n" });
            }
            seenTag = false;
            lineStart = tokens.length;
          }
          function changeDelimiters(text2, index3) {
            var close = "=" + ctag, closeIndex = text2.indexOf(close, index3), delimiters2 = trim(
              text2.substring(text2.indexOf("=", index3) + 1, closeIndex)
            ).split(" ");
            otag = delimiters2[0];
            ctag = delimiters2[delimiters2.length - 1];
            return closeIndex + close.length - 1;
          }
          if (delimiters) {
            delimiters = delimiters.split(" ");
            otag = delimiters[0];
            ctag = delimiters[1];
          }
          for (i2 = 0; i2 < len; i2++) {
            if (state == IN_TEXT) {
              if (tagChange(otag, text, i2)) {
                --i2;
                addBuf();
                state = IN_TAG_TYPE;
              } else {
                if (text.charAt(i2) == "\n") {
                  filterLine(seenTag);
                } else {
                  buf += text.charAt(i2);
                }
              }
            } else if (state == IN_TAG_TYPE) {
              i2 += otag.length - 1;
              tag = Hogan2.tags[text.charAt(i2 + 1)];
              tagType = tag ? text.charAt(i2 + 1) : "_v";
              if (tagType == "=") {
                i2 = changeDelimiters(text, i2);
                state = IN_TEXT;
              } else {
                if (tag) {
                  i2++;
                }
                state = IN_TAG;
              }
              seenTag = i2;
            } else {
              if (tagChange(ctag, text, i2)) {
                tokens.push({
                  tag: tagType,
                  n: trim(buf),
                  otag,
                  ctag,
                  i: tagType == "/" ? seenTag - otag.length : i2 + ctag.length
                });
                buf = "";
                i2 += ctag.length - 1;
                state = IN_TEXT;
                if (tagType == "{") {
                  if (ctag == "}}") {
                    i2++;
                  } else {
                    cleanTripleStache(tokens[tokens.length - 1]);
                  }
                }
              } else {
                buf += text.charAt(i2);
              }
            }
          }
          filterLine(seenTag, true);
          return tokens;
        };
        function cleanTripleStache(token) {
          if (token.n.substr(token.n.length - 1) === "}") {
            token.n = token.n.substring(0, token.n.length - 1);
          }
        }
        function trim(s2) {
          if (s2.trim) {
            return s2.trim();
          }
          return s2.replace(/^\s*|\s*$/g, "");
        }
        function tagChange(tag, text, index3) {
          if (text.charAt(index3) != tag.charAt(0)) {
            return false;
          }
          for (var i2 = 1, l2 = tag.length; i2 < l2; i2++) {
            if (text.charAt(index3 + i2) != tag.charAt(i2)) {
              return false;
            }
          }
          return true;
        }
        var allowedInSuper = { "_t": true, "\n": true, "$": true, "/": true };
        function buildTree(tokens, kind, stack, customTags) {
          var instructions = [], opener = null, tail = null, token = null;
          tail = stack[stack.length - 1];
          while (tokens.length > 0) {
            token = tokens.shift();
            if (tail && tail.tag == "<" && !(token.tag in allowedInSuper)) {
              throw new Error("Illegal content in < super tag.");
            }
            if (Hogan2.tags[token.tag] <= Hogan2.tags["$"] || isOpener(token, customTags)) {
              stack.push(token);
              token.nodes = buildTree(tokens, token.tag, stack, customTags);
            } else if (token.tag == "/") {
              if (stack.length === 0) {
                throw new Error("Closing tag without opener: /" + token.n);
              }
              opener = stack.pop();
              if (token.n != opener.n && !isCloser(token.n, opener.n, customTags)) {
                throw new Error("Nesting error: " + opener.n + " vs. " + token.n);
              }
              opener.end = token.i;
              return instructions;
            } else if (token.tag == "\n") {
              token.last = tokens.length == 0 || tokens[0].tag == "\n";
            }
            instructions.push(token);
          }
          if (stack.length > 0) {
            throw new Error("missing closing tag: " + stack.pop().n);
          }
          return instructions;
        }
        function isOpener(token, tags) {
          for (var i2 = 0, l2 = tags.length; i2 < l2; i2++) {
            if (tags[i2].o == token.n) {
              token.tag = "#";
              return true;
            }
          }
        }
        function isCloser(close, open, tags) {
          for (var i2 = 0, l2 = tags.length; i2 < l2; i2++) {
            if (tags[i2].c == close && tags[i2].o == open) {
              return true;
            }
          }
        }
        function stringifySubstitutions(obj) {
          var items = [];
          for (var key2 in obj) {
            items.push('"' + esc(key2) + '": function(c,p,t,i) {' + obj[key2] + "}");
          }
          return "{ " + items.join(",") + " }";
        }
        function stringifyPartials(codeObj) {
          var partials = [];
          for (var key2 in codeObj.partials) {
            partials.push('"' + esc(key2) + '":{name:"' + esc(codeObj.partials[key2].name) + '", ' + stringifyPartials(codeObj.partials[key2]) + "}");
          }
          return "partials: {" + partials.join(",") + "}, subs: " + stringifySubstitutions(codeObj.subs);
        }
        Hogan2.stringify = function(codeObj, text, options) {
          return "{code: function (c,p,i) { " + Hogan2.wrapMain(codeObj.code) + " }," + stringifyPartials(codeObj) + "}";
        };
        var serialNo = 0;
        Hogan2.generate = function(tree, text, options) {
          serialNo = 0;
          var context = { code: "", subs: {}, partials: {} };
          Hogan2.walk(tree, context);
          if (options.asString) {
            return this.stringify(context, text, options);
          }
          return this.makeTemplate(context, text, options);
        };
        Hogan2.wrapMain = function(code) {
          return 'var t=this;t.b(i=i||"");' + code + "return t.fl();";
        };
        Hogan2.template = Hogan2.Template;
        Hogan2.makeTemplate = function(codeObj, text, options) {
          var template = this.makePartials(codeObj);
          template.code = new Function("c", "p", "i", this.wrapMain(codeObj.code));
          return new this.template(template, text, this, options);
        };
        Hogan2.makePartials = function(codeObj) {
          var key2, template = { subs: {}, partials: codeObj.partials, name: codeObj.name };
          for (key2 in template.partials) {
            template.partials[key2] = this.makePartials(template.partials[key2]);
          }
          for (key2 in codeObj.subs) {
            template.subs[key2] = new Function("c", "p", "t", "i", codeObj.subs[key2]);
          }
          return template;
        };
        function esc(s2) {
          return s2.replace(rSlash, "\\\\").replace(rQuot, '\\"').replace(rNewline, "\\n").replace(rCr, "\\r").replace(rLineSep, "\\u2028").replace(rParagraphSep, "\\u2029");
        }
        function chooseMethod(s2) {
          return ~s2.indexOf(".") ? "d" : "f";
        }
        function createPartial(node, context) {
          var prefix = "<" + (context.prefix || "");
          var sym = prefix + node.n + serialNo++;
          context.partials[sym] = { name: node.n, partials: {} };
          context.code += 't.b(t.rp("' + esc(sym) + '",c,p,"' + (node.indent || "") + '"));';
          return sym;
        }
        Hogan2.codegen = {
          "#": function(node, context) {
            context.code += "if(t.s(t." + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,1),c,p,0,' + node.i + "," + node.end + ',"' + node.otag + " " + node.ctag + '")){t.rs(c,p,function(c,p,t){';
            Hogan2.walk(node.nodes, context);
            context.code += "});c.pop();}";
          },
          "^": function(node, context) {
            context.code += "if(!t.s(t." + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,1),c,p,1,0,0,"")){';
            Hogan2.walk(node.nodes, context);
            context.code += "};";
          },
          ">": createPartial,
          "<": function(node, context) {
            var ctx = { partials: {}, code: "", subs: {}, inPartial: true };
            Hogan2.walk(node.nodes, ctx);
            var template = context.partials[createPartial(node, context)];
            template.subs = ctx.subs;
            template.partials = ctx.partials;
          },
          "$": function(node, context) {
            var ctx = { subs: {}, code: "", partials: context.partials, prefix: node.n };
            Hogan2.walk(node.nodes, ctx);
            context.subs[node.n] = ctx.code;
            if (!context.inPartial) {
              context.code += 't.sub("' + esc(node.n) + '",c,p,i);';
            }
          },
          "\n": function(node, context) {
            context.code += write('"\\n"' + (node.last ? "" : " + i"));
          },
          "_v": function(node, context) {
            context.code += "t.b(t.v(t." + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,0)));';
          },
          "_t": function(node, context) {
            context.code += write('"' + esc(node.text) + '"');
          },
          "{": tripleStache,
          "&": tripleStache
        };
        function tripleStache(node, context) {
          context.code += "t.b(t.t(t." + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,0)));';
        }
        function write(s2) {
          return "t.b(" + s2 + ");";
        }
        Hogan2.walk = function(nodelist, context) {
          var func;
          for (var i2 = 0, l2 = nodelist.length; i2 < l2; i2++) {
            func = Hogan2.codegen[nodelist[i2].tag];
            func && func(nodelist[i2], context);
          }
          return context;
        };
        Hogan2.parse = function(tokens, text, options) {
          options = options || {};
          return buildTree(tokens, "", [], options.sectionTags || []);
        };
        Hogan2.cache = {};
        Hogan2.cacheKey = function(text, options) {
          return [text, !!options.asString, !!options.disableLambda, options.delimiters, !!options.modelGet].join("||");
        };
        Hogan2.compile = function(text, options) {
          options = options || {};
          var key2 = Hogan2.cacheKey(text, options);
          var template = this.cache[key2];
          if (template) {
            var partials = template.partials;
            for (var name in partials) {
              delete partials[name].instance;
            }
            return template;
          }
          template = this.generate(this.parse(this.scan(text, options.delimiters), text, options), text, options);
          return this.cache[key2] = template;
        };
      })(typeof exports !== "undefined" ? exports : Hogan);
    }
  });

  // ../../node_modules/hogan.js/lib/template.js
  var require_template = __commonJS({
    "../../node_modules/hogan.js/lib/template.js"(exports) {
      var Hogan2 = {};
      (function(Hogan3) {
        Hogan3.Template = function(codeObj, text, compiler, options) {
          codeObj = codeObj || {};
          this.r = codeObj.code || this.r;
          this.c = compiler;
          this.options = options || {};
          this.text = text || "";
          this.partials = codeObj.partials || {};
          this.subs = codeObj.subs || {};
          this.buf = "";
        };
        Hogan3.Template.prototype = {
          // render: replaced by generated code.
          r: function(context, partials, indent) {
            return "";
          },
          // variable escaping
          v: hoganEscape,
          // triple stache
          t: coerceToString,
          render: function render(context, partials, indent) {
            return this.ri([context], partials || {}, indent);
          },
          // render internal -- a hook for overrides that catches partials too
          ri: function(context, partials, indent) {
            return this.r(context, partials, indent);
          },
          // ensurePartial
          ep: function(symbol, partials) {
            var partial = this.partials[symbol];
            var template = partials[partial.name];
            if (partial.instance && partial.base == template) {
              return partial.instance;
            }
            if (typeof template == "string") {
              if (!this.c) {
                throw new Error("No compiler available.");
              }
              template = this.c.compile(template, this.options);
            }
            if (!template) {
              return null;
            }
            this.partials[symbol].base = template;
            if (partial.subs) {
              if (!partials.stackText) partials.stackText = {};
              for (key in partial.subs) {
                if (!partials.stackText[key]) {
                  partials.stackText[key] = this.activeSub !== void 0 && partials.stackText[this.activeSub] ? partials.stackText[this.activeSub] : this.text;
                }
              }
              template = createSpecializedPartial(
                template,
                partial.subs,
                partial.partials,
                this.stackSubs,
                this.stackPartials,
                partials.stackText
              );
            }
            this.partials[symbol].instance = template;
            return template;
          },
          // tries to find a partial in the current scope and render it
          rp: function(symbol, context, partials, indent) {
            var partial = this.ep(symbol, partials);
            if (!partial) {
              return "";
            }
            return partial.ri(context, partials, indent);
          },
          // render a section
          rs: function(context, partials, section) {
            var tail = context[context.length - 1];
            if (!isArray(tail)) {
              section(context, partials, this);
              return;
            }
            for (var i2 = 0; i2 < tail.length; i2++) {
              context.push(tail[i2]);
              section(context, partials, this);
              context.pop();
            }
          },
          // maybe start a section
          s: function(val, ctx, partials, inverted, start, end, tags) {
            var pass;
            if (isArray(val) && val.length === 0) {
              return false;
            }
            if (typeof val == "function") {
              val = this.ms(val, ctx, partials, inverted, start, end, tags);
            }
            pass = !!val;
            if (!inverted && pass && ctx) {
              ctx.push(typeof val == "object" ? val : ctx[ctx.length - 1]);
            }
            return pass;
          },
          // find values with dotted names
          d: function(key2, ctx, partials, returnFound) {
            var found, names = key2.split("."), val = this.f(names[0], ctx, partials, returnFound), doModelGet = this.options.modelGet, cx2 = null;
            if (key2 === "." && isArray(ctx[ctx.length - 2])) {
              val = ctx[ctx.length - 1];
            } else {
              for (var i2 = 1; i2 < names.length; i2++) {
                found = findInScope(names[i2], val, doModelGet);
                if (found !== void 0) {
                  cx2 = val;
                  val = found;
                } else {
                  val = "";
                }
              }
            }
            if (returnFound && !val) {
              return false;
            }
            if (!returnFound && typeof val == "function") {
              ctx.push(cx2);
              val = this.mv(val, ctx, partials);
              ctx.pop();
            }
            return val;
          },
          // find values with normal names
          f: function(key2, ctx, partials, returnFound) {
            var val = false, v2 = null, found = false, doModelGet = this.options.modelGet;
            for (var i2 = ctx.length - 1; i2 >= 0; i2--) {
              v2 = ctx[i2];
              val = findInScope(key2, v2, doModelGet);
              if (val !== void 0) {
                found = true;
                break;
              }
            }
            if (!found) {
              return returnFound ? false : "";
            }
            if (!returnFound && typeof val == "function") {
              val = this.mv(val, ctx, partials);
            }
            return val;
          },
          // higher order templates
          ls: function(func, cx2, partials, text, tags) {
            var oldTags = this.options.delimiters;
            this.options.delimiters = tags;
            this.b(this.ct(coerceToString(func.call(cx2, text)), cx2, partials));
            this.options.delimiters = oldTags;
            return false;
          },
          // compile text
          ct: function(text, cx2, partials) {
            if (this.options.disableLambda) {
              throw new Error("Lambda features disabled.");
            }
            return this.c.compile(text, this.options).render(cx2, partials);
          },
          // template result buffering
          b: function(s2) {
            this.buf += s2;
          },
          fl: function() {
            var r2 = this.buf;
            this.buf = "";
            return r2;
          },
          // method replace section
          ms: function(func, ctx, partials, inverted, start, end, tags) {
            var textSource, cx2 = ctx[ctx.length - 1], result = func.call(cx2);
            if (typeof result == "function") {
              if (inverted) {
                return true;
              } else {
                textSource = this.activeSub && this.subsText && this.subsText[this.activeSub] ? this.subsText[this.activeSub] : this.text;
                return this.ls(result, cx2, partials, textSource.substring(start, end), tags);
              }
            }
            return result;
          },
          // method replace variable
          mv: function(func, ctx, partials) {
            var cx2 = ctx[ctx.length - 1];
            var result = func.call(cx2);
            if (typeof result == "function") {
              return this.ct(coerceToString(result.call(cx2)), cx2, partials);
            }
            return result;
          },
          sub: function(name, context, partials, indent) {
            var f2 = this.subs[name];
            if (f2) {
              this.activeSub = name;
              f2(context, partials, this, indent);
              this.activeSub = false;
            }
          }
        };
        function findInScope(key2, scope, doModelGet) {
          var val;
          if (scope && typeof scope == "object") {
            if (scope[key2] !== void 0) {
              val = scope[key2];
            } else if (doModelGet && scope.get && typeof scope.get == "function") {
              val = scope.get(key2);
            }
          }
          return val;
        }
        function createSpecializedPartial(instance, subs, partials, stackSubs, stackPartials, stackText) {
          function PartialTemplate() {
          }
          ;
          PartialTemplate.prototype = instance;
          function Substitutions() {
          }
          ;
          Substitutions.prototype = instance.subs;
          var key2;
          var partial = new PartialTemplate();
          partial.subs = new Substitutions();
          partial.subsText = {};
          partial.buf = "";
          stackSubs = stackSubs || {};
          partial.stackSubs = stackSubs;
          partial.subsText = stackText;
          for (key2 in subs) {
            if (!stackSubs[key2]) stackSubs[key2] = subs[key2];
          }
          for (key2 in stackSubs) {
            partial.subs[key2] = stackSubs[key2];
          }
          stackPartials = stackPartials || {};
          partial.stackPartials = stackPartials;
          for (key2 in partials) {
            if (!stackPartials[key2]) stackPartials[key2] = partials[key2];
          }
          for (key2 in stackPartials) {
            partial.partials[key2] = stackPartials[key2];
          }
          return partial;
        }
        var rAmp = /&/g, rLt = /</g, rGt = />/g, rApos = /\'/g, rQuot = /\"/g, hChars = /[&<>\"\']/;
        function coerceToString(val) {
          return String(val === null || val === void 0 ? "" : val);
        }
        function hoganEscape(str) {
          str = coerceToString(str);
          return hChars.test(str) ? str.replace(rAmp, "&amp;").replace(rLt, "&lt;").replace(rGt, "&gt;").replace(rApos, "&#39;").replace(rQuot, "&quot;") : str;
        }
        var isArray = Array.isArray || function(a2) {
          return Object.prototype.toString.call(a2) === "[object Array]";
        };
      })(typeof exports !== "undefined" ? exports : Hogan2);
    }
  });

  // ../../node_modules/hogan.js/lib/hogan.js
  var require_hogan = __commonJS({
    "../../node_modules/hogan.js/lib/hogan.js"(exports, module) {
      var Hogan2 = require_compiler();
      Hogan2.Template = require_template().Template;
      Hogan2.template = Hogan2.Template;
      module.exports = Hogan2;
    }
  });

  // <stdin>
  var import_lite = __toESM(require_algoliasearch_lite_umd());

  // node_modules/instantsearch.js/es/lib/suit.js
  var NAMESPACE = "ais";
  var component = function component2(componentName) {
    return function() {
      var _ref = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, descendantName = _ref.descendantName, modifierName = _ref.modifierName;
      var descendent = descendantName ? "-".concat(descendantName) : "";
      var modifier = modifierName ? "--".concat(modifierName) : "";
      return "".concat(NAMESPACE, "-").concat(componentName).concat(descendent).concat(modifier);
    };
  };

  // node_modules/instantsearch.js/es/lib/utils/addWidgetId.js
  var id = 0;
  function addWidgetId(widget) {
    if (widget.dependsOn !== "recommend") {
      return;
    }
    widget.$$id = id++;
  }

  // node_modules/instantsearch.js/es/lib/utils/capitalize.js
  function capitalize(text) {
    return text.toString().charAt(0).toUpperCase() + text.toString().slice(1);
  }

  // node_modules/instantsearch.js/es/lib/utils/noop.js
  function noop() {
  }

  // node_modules/instantsearch.js/es/lib/utils/logger.js
  var deprecate = function deprecate2(fn, message) {
    return fn;
  };
  var warn = noop;
  var _warning = noop;
  if (true) {
    warn = function warn2(message) {
      console.warn("[InstantSearch.js]: ".concat(message.trim()));
    };
    deprecate = function deprecate3(fn, message) {
      var hasAlreadyPrinted = false;
      return function() {
        if (!hasAlreadyPrinted) {
          hasAlreadyPrinted = true;
          true ? warn(message) : void 0;
        }
        return fn.apply(void 0, arguments);
      };
    };
    _warning = function warning(condition, message) {
      if (condition) {
        return;
      }
      var hasAlreadyPrinted = _warning.cache[message];
      if (!hasAlreadyPrinted) {
        _warning.cache[message] = true;
        true ? warn(message) : void 0;
      }
    };
    _warning.cache = {};
  }

  // node_modules/instantsearch.js/es/lib/utils/typedObject.js
  var keys = Object.keys;

  // node_modules/instantsearch.js/es/lib/utils/checkIndexUiState.js
  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }
  function _slicedToArray(arr, i2) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i2) || _unsupportedIterableToArray(arr, i2) || _nonIterableRest();
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray(o2, minLen) {
    if (!o2) return;
    if (typeof o2 === "string") return _arrayLikeToArray(o2, minLen);
    var n3 = Object.prototype.toString.call(o2).slice(8, -1);
    if (n3 === "Object" && o2.constructor) n3 = o2.constructor.name;
    if (n3 === "Map" || n3 === "Set") return Array.from(o2);
    if (n3 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n3)) return _arrayLikeToArray(o2, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i2 = 0, arr2 = new Array(len); i2 < len; i2++) arr2[i2] = arr[i2];
    return arr2;
  }
  function _iterableToArrayLimit(arr, i2) {
    var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
    if (null != _i) {
      var _s, _e, _x, _r, _arr = [], _n = true, _d = false;
      try {
        if (_x = (_i = _i.call(arr)).next, 0 === i2) {
          if (Object(_i) !== _i) return;
          _n = false;
        } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i2); _n = true) ;
      } catch (err) {
        _d = true, _e = err;
      } finally {
        try {
          if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function getWidgetNames(connectorName) {
    switch (connectorName) {
      case "range":
        return [];
      case "menu":
        return ["menu", "menuSelect"];
      default:
        return [connectorName];
    }
  }
  var stateToWidgetsMap = {
    query: {
      connectors: ["connectSearchBox"],
      widgets: ["ais.searchBox", "ais.autocomplete", "ais.voiceSearch"]
    },
    refinementList: {
      connectors: ["connectRefinementList"],
      widgets: ["ais.refinementList"]
    },
    menu: {
      connectors: ["connectMenu"],
      widgets: ["ais.menu"]
    },
    hierarchicalMenu: {
      connectors: ["connectHierarchicalMenu"],
      widgets: ["ais.hierarchicalMenu"]
    },
    numericMenu: {
      connectors: ["connectNumericMenu"],
      widgets: ["ais.numericMenu"]
    },
    ratingMenu: {
      connectors: ["connectRatingMenu"],
      widgets: ["ais.ratingMenu"]
    },
    range: {
      connectors: ["connectRange"],
      widgets: ["ais.rangeInput", "ais.rangeSlider", "ais.range"]
    },
    toggle: {
      connectors: ["connectToggleRefinement"],
      widgets: ["ais.toggleRefinement"]
    },
    geoSearch: {
      connectors: ["connectGeoSearch"],
      widgets: ["ais.geoSearch"]
    },
    sortBy: {
      connectors: ["connectSortBy"],
      widgets: ["ais.sortBy"]
    },
    page: {
      connectors: ["connectPagination"],
      widgets: ["ais.pagination", "ais.infiniteHits"]
    },
    hitsPerPage: {
      connectors: ["connectHitsPerPage"],
      widgets: ["ais.hitsPerPage"]
    },
    configure: {
      connectors: ["connectConfigure"],
      widgets: ["ais.configure"]
    },
    places: {
      connectors: [],
      widgets: ["ais.places"]
    }
  };
  function checkIndexUiState(_ref) {
    var index3 = _ref.index, indexUiState = _ref.indexUiState;
    var mountedWidgets = index3.getWidgets().map(function(widget) {
      return widget.$$type;
    }).filter(Boolean);
    var missingWidgets = keys(indexUiState).reduce(function(acc, parameter) {
      var widgetUiState = stateToWidgetsMap[parameter];
      if (!widgetUiState) {
        return acc;
      }
      var requiredWidgets = widgetUiState.widgets;
      if (requiredWidgets && !requiredWidgets.some(function(requiredWidget) {
        return mountedWidgets.includes(requiredWidget);
      })) {
        acc.push([parameter, {
          connectors: widgetUiState.connectors,
          widgets: widgetUiState.widgets.map(function(widgetIdentifier) {
            return widgetIdentifier.split("ais.")[1];
          })
        }]);
      }
      return acc;
    }, []);
    true ? _warning(missingWidgets.length === 0, 'The UI state for the index "'.concat(index3.getIndexId(), '" is not consistent with the widgets mounted.\n\nThis can happen when the UI state is specified via `initialUiState`, `routing` or `setUiState` but that the widgets responsible for this state were not added. This results in those query parameters not being sent to the API.\n\nTo fully reflect the state, some widgets need to be added to the index "').concat(index3.getIndexId(), '":\n\n').concat(missingWidgets.map(function(_ref2) {
      var _ref4;
      var _ref3 = _slicedToArray(_ref2, 2), stateParameter = _ref3[0], widgets = _ref3[1].widgets;
      return "- `".concat(stateParameter, "` needs one of these widgets: ").concat((_ref4 = []).concat.apply(_ref4, _toConsumableArray(widgets.map(function(name) {
        return getWidgetNames(name);
      }))).map(function(name) {
        return '"'.concat(name, '"');
      }).join(", "));
    }).join("\n"), '\n\nIf you do not wish to display widgets but still want to support their search parameters, you can mount "virtual widgets" that don\'t render anything:\n\n```\n').concat(missingWidgets.filter(function(_ref5) {
      var _ref6 = _slicedToArray(_ref5, 2), _stateParameter = _ref6[0], connectors = _ref6[1].connectors;
      return connectors.length > 0;
    }).map(function(_ref7) {
      var _ref8 = _slicedToArray(_ref7, 2), _stateParameter = _ref8[0], _ref8$ = _ref8[1], connectors = _ref8$.connectors, widgets = _ref8$.widgets;
      var capitalizedWidget = capitalize(widgets[0]);
      var connectorName = connectors[0];
      return "const virtual".concat(capitalizedWidget, " = ").concat(connectorName, "(() => null);");
    }).join("\n"), "\n\nsearch.addWidgets([\n  ").concat(missingWidgets.filter(function(_ref9) {
      var _ref10 = _slicedToArray(_ref9, 2), _stateParameter = _ref10[0], connectors = _ref10[1].connectors;
      return connectors.length > 0;
    }).map(function(_ref11) {
      var _ref12 = _slicedToArray(_ref11, 2), _stateParameter = _ref12[0], widgets = _ref12[1].widgets;
      var capitalizedWidget = capitalize(widgets[0]);
      return "virtual".concat(capitalizedWidget, "({ /* ... */ })");
    }).join(",\n  "), "\n]);\n```\n\nIf you're using custom widgets that do set these query parameters, we recommend using connectors instead.\n\nSee https://www.algolia.com/doc/guides/building-search-ui/widgets/customize-an-existing-widget/js/#customize-the-complete-ui-of-the-widgets")) : void 0;
  }

  // node_modules/instantsearch.js/es/lib/utils/getObjectType.js
  function getObjectType(object) {
    return Object.prototype.toString.call(object).slice(8, -1);
  }

  // node_modules/instantsearch.js/es/lib/utils/checkRendering.js
  function checkRendering(rendering, usage) {
    if (rendering === void 0 || typeof rendering !== "function") {
      throw new Error("The render function is not valid (received type ".concat(getObjectType(rendering), ").\n\n").concat(usage));
    }
  }

  // node_modules/instantsearch.js/es/lib/utils/escape-html.js
  var htmlEntities = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };
  var regexUnescapedHtml = /[&<>"']/g;
  var regexHasUnescapedHtml = RegExp(regexUnescapedHtml.source);
  function escape2(value) {
    return value && regexHasUnescapedHtml.test(value) ? value.replace(regexUnescapedHtml, function(character) {
      return htmlEntities[character];
    }) : value;
  }
  var htmlCharacters = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'"
  };
  var regexEscapedHtml = /&(amp|quot|lt|gt|#39);/g;
  var regexHasEscapedHtml = RegExp(regexEscapedHtml.source);
  function unescape2(value) {
    return value && regexHasEscapedHtml.test(value) ? value.replace(regexEscapedHtml, function(character) {
      return htmlCharacters[character];
    }) : value;
  }

  // node_modules/instantsearch.js/es/lib/utils/isPlainObject.js
  function _typeof(obj) {
    "@babel/helpers - typeof";
    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof(obj);
  }
  function getTag(value) {
    if (value === null) {
      return value === void 0 ? "[object Undefined]" : "[object Null]";
    }
    return Object.prototype.toString.call(value);
  }
  function isObjectLike(value) {
    return _typeof(value) === "object" && value !== null;
  }
  function isPlainObject(value) {
    if (!isObjectLike(value) || getTag(value) !== "[object Object]") {
      return false;
    }
    if (Object.getPrototypeOf(value) === null) {
      return true;
    }
    var proto = value;
    while (Object.getPrototypeOf(proto) !== null) {
      proto = Object.getPrototypeOf(proto);
    }
    return Object.getPrototypeOf(value) === proto;
  }

  // node_modules/instantsearch.js/es/lib/utils/escape-highlight.js
  function _typeof2(obj) {
    "@babel/helpers - typeof";
    return _typeof2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof2(obj);
  }
  function _objectDestructuringEmpty(obj) {
    if (obj == null) throw new TypeError("Cannot destructure " + obj);
  }
  function _extends() {
    _extends = Object.assign ? Object.assign.bind() : function(target) {
      for (var i2 = 1; i2 < arguments.length; i2++) {
        var source = arguments[i2];
        for (var key2 in source) {
          if (Object.prototype.hasOwnProperty.call(source, key2)) {
            target[key2] = source[key2];
          }
        }
      }
      return target;
    };
    return _extends.apply(this, arguments);
  }
  function ownKeys(object, enumerableOnly) {
    var keys2 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys2.push.apply(keys2, symbols);
    }
    return keys2;
  }
  function _objectSpread(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys(Object(source), true).forEach(function(key2) {
        _defineProperty(target, key2, source[key2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key2) {
        Object.defineProperty(target, key2, Object.getOwnPropertyDescriptor(source, key2));
      });
    }
    return target;
  }
  function _defineProperty(obj, key2, value) {
    key2 = _toPropertyKey(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey(arg) {
    var key2 = _toPrimitive(arg, "string");
    return _typeof2(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive(input, hint) {
    if (_typeof2(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof2(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  var TAG_PLACEHOLDER = {
    highlightPreTag: "__ais-highlight__",
    highlightPostTag: "__/ais-highlight__"
  };
  var TAG_REPLACEMENT = {
    highlightPreTag: "<mark>",
    highlightPostTag: "</mark>"
  };
  function replaceTagsAndEscape(value) {
    return escape2(value).replace(new RegExp(TAG_PLACEHOLDER.highlightPreTag, "g"), TAG_REPLACEMENT.highlightPreTag).replace(new RegExp(TAG_PLACEHOLDER.highlightPostTag, "g"), TAG_REPLACEMENT.highlightPostTag);
  }
  function recursiveEscape(input) {
    if (isPlainObject(input) && typeof input.value !== "string") {
      return Object.keys(input).reduce(function(acc, key2) {
        return _objectSpread(_objectSpread({}, acc), {}, _defineProperty({}, key2, recursiveEscape(input[key2])));
      }, {});
    }
    if (Array.isArray(input)) {
      return input.map(recursiveEscape);
    }
    return _objectSpread(_objectSpread({}, input), {}, {
      value: replaceTagsAndEscape(input.value)
    });
  }
  function escapeHits(hits2) {
    if (hits2.__escaped === void 0) {
      hits2 = hits2.map(function(_ref) {
        var hit = _extends({}, (_objectDestructuringEmpty(_ref), _ref));
        if (hit._highlightResult) {
          hit._highlightResult = recursiveEscape(hit._highlightResult);
        }
        if (hit._snippetResult) {
          hit._snippetResult = recursiveEscape(hit._snippetResult);
        }
        return hit;
      });
      hits2.__escaped = true;
    }
    return hits2;
  }

  // node_modules/instantsearch.js/es/lib/utils/concatHighlightedParts.js
  function concatHighlightedParts(parts) {
    var highlightPreTag = TAG_REPLACEMENT.highlightPreTag, highlightPostTag = TAG_REPLACEMENT.highlightPostTag;
    return parts.map(function(part) {
      return part.isHighlighted ? highlightPreTag + part.value + highlightPostTag : part.value;
    }).join("");
  }

  // node_modules/instantsearch.js/es/lib/utils/createConcurrentSafePromise.js
  function createConcurrentSafePromise() {
    var basePromiseId = -1;
    var latestResolvedId = -1;
    var latestResolvedValue = void 0;
    return function runConcurrentSafePromise(promise) {
      var currentPromiseId = ++basePromiseId;
      return Promise.resolve(promise).then(function(x) {
        if (latestResolvedValue && currentPromiseId < latestResolvedId) {
          return latestResolvedValue;
        }
        latestResolvedId = currentPromiseId;
        latestResolvedValue = x;
        return x;
      });
    };
  }

  // node_modules/instantsearch.js/es/lib/utils/serializer.js
  function serializePayload(payload) {
    return btoa(encodeURIComponent(JSON.stringify(payload)));
  }
  function deserializePayload(serialized) {
    return JSON.parse(decodeURIComponent(atob(serialized)));
  }

  // node_modules/instantsearch.js/es/lib/utils/createSendEventForHits.js
  function ownKeys2(object, enumerableOnly) {
    var keys2 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys2.push.apply(keys2, symbols);
    }
    return keys2;
  }
  function _objectSpread2(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys2(Object(source), true).forEach(function(key2) {
        _defineProperty2(target, key2, source[key2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys2(Object(source)).forEach(function(key2) {
        Object.defineProperty(target, key2, Object.getOwnPropertyDescriptor(source, key2));
      });
    }
    return target;
  }
  function _defineProperty2(obj, key2, value) {
    key2 = _toPropertyKey2(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey2(arg) {
    var key2 = _toPrimitive2(arg, "string");
    return _typeof3(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive2(input, hint) {
    if (_typeof3(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof3(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _slicedToArray2(arr, i2) {
    return _arrayWithHoles2(arr) || _iterableToArrayLimit2(arr, i2) || _unsupportedIterableToArray2(arr, i2) || _nonIterableRest2();
  }
  function _nonIterableRest2() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray2(o2, minLen) {
    if (!o2) return;
    if (typeof o2 === "string") return _arrayLikeToArray2(o2, minLen);
    var n3 = Object.prototype.toString.call(o2).slice(8, -1);
    if (n3 === "Object" && o2.constructor) n3 = o2.constructor.name;
    if (n3 === "Map" || n3 === "Set") return Array.from(o2);
    if (n3 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n3)) return _arrayLikeToArray2(o2, minLen);
  }
  function _arrayLikeToArray2(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i2 = 0, arr2 = new Array(len); i2 < len; i2++) arr2[i2] = arr[i2];
    return arr2;
  }
  function _iterableToArrayLimit2(arr, i2) {
    var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
    if (null != _i) {
      var _s, _e, _x, _r, _arr = [], _n = true, _d = false;
      try {
        if (_x = (_i = _i.call(arr)).next, 0 === i2) {
          if (Object(_i) !== _i) return;
          _n = false;
        } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i2); _n = true) ;
      } catch (err) {
        _d = true, _e = err;
      } finally {
        try {
          if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
  }
  function _arrayWithHoles2(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _typeof3(obj) {
    "@babel/helpers - typeof";
    return _typeof3 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof3(obj);
  }
  function chunk(arr) {
    var chunkSize = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 20;
    var chunks = [];
    for (var i2 = 0; i2 < Math.ceil(arr.length / chunkSize); i2++) {
      chunks.push(arr.slice(i2 * chunkSize, (i2 + 1) * chunkSize));
    }
    return chunks;
  }
  function _buildEventPayloadsForHits(_ref) {
    var getIndex = _ref.getIndex, widgetType = _ref.widgetType, methodName = _ref.methodName, args = _ref.args, instantSearchInstance = _ref.instantSearchInstance;
    if (args.length === 1 && _typeof3(args[0]) === "object") {
      return [args[0]];
    }
    var _args$0$split = args[0].split(":"), _args$0$split2 = _slicedToArray2(_args$0$split, 2), eventType = _args$0$split2[0], eventModifier = _args$0$split2[1];
    var hits2 = args[1];
    var eventName = args[2];
    var additionalData = args[3] || {};
    if (!hits2) {
      if (true) {
        throw new Error("You need to pass hit or hits as the second argument like:\n  ".concat(methodName, "(eventType, hit);\n  "));
      } else {
        return [];
      }
    }
    if ((eventType === "click" || eventType === "conversion") && !eventName) {
      if (true) {
        throw new Error("You need to pass eventName as the third argument for 'click' or 'conversion' events like:\n  ".concat(methodName, "('click', hit, 'Product Purchased');\n\n  To learn more about event naming: https://www.algolia.com/doc/guides/getting-insights-and-analytics/search-analytics/click-through-and-conversions/in-depth/clicks-conversions-best-practices/\n  "));
      } else {
        return [];
      }
    }
    var hitsArray = Array.isArray(hits2) ? hits2 : [hits2];
    if (hitsArray.length === 0) {
      return [];
    }
    var queryID = hitsArray[0].__queryID;
    var hitsChunks = chunk(hitsArray);
    var objectIDsByChunk = hitsChunks.map(function(batch) {
      return batch.map(function(hit) {
        return hit.objectID;
      });
    });
    var positionsByChunk = hitsChunks.map(function(batch) {
      return batch.map(function(hit) {
        return hit.__position;
      });
    });
    if (eventType === "view") {
      if (instantSearchInstance.status !== "idle") {
        return [];
      }
      return hitsChunks.map(function(batch, i2) {
        return {
          insightsMethod: "viewedObjectIDs",
          widgetType,
          eventType,
          payload: _objectSpread2({
            eventName: eventName || "Hits Viewed",
            index: getIndex(),
            objectIDs: objectIDsByChunk[i2]
          }, additionalData),
          hits: batch,
          eventModifier
        };
      });
    } else if (eventType === "click") {
      return hitsChunks.map(function(batch, i2) {
        return {
          insightsMethod: "clickedObjectIDsAfterSearch",
          widgetType,
          eventType,
          payload: _objectSpread2({
            eventName: eventName || "Hit Clicked",
            index: getIndex(),
            queryID,
            objectIDs: objectIDsByChunk[i2],
            positions: positionsByChunk[i2]
          }, additionalData),
          hits: batch,
          eventModifier
        };
      });
    } else if (eventType === "conversion") {
      return hitsChunks.map(function(batch, i2) {
        return {
          insightsMethod: "convertedObjectIDsAfterSearch",
          widgetType,
          eventType,
          payload: _objectSpread2({
            eventName: eventName || "Hit Converted",
            index: getIndex(),
            queryID,
            objectIDs: objectIDsByChunk[i2]
          }, additionalData),
          hits: batch,
          eventModifier
        };
      });
    } else if (true) {
      throw new Error('eventType("'.concat(eventType, '") is not supported.\n    If you want to send a custom payload, you can pass one object: ').concat(methodName, "(customPayload);\n    "));
    } else {
      return [];
    }
  }
  function createSendEventForHits(_ref2) {
    var instantSearchInstance = _ref2.instantSearchInstance, getIndex = _ref2.getIndex, widgetType = _ref2.widgetType;
    var sentEvents = {};
    var timer = void 0;
    var sendEventForHits = function sendEventForHits2() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      var payloads = _buildEventPayloadsForHits({
        widgetType,
        getIndex,
        methodName: "sendEvent",
        args,
        instantSearchInstance
      });
      payloads.forEach(function(payload) {
        if (payload.eventType === "click" && payload.eventModifier === "internal" && sentEvents[payload.eventType]) {
          return;
        }
        sentEvents[payload.eventType] = true;
        instantSearchInstance.sendEventToInsights(payload);
      });
      clearTimeout(timer);
      timer = setTimeout(function() {
        sentEvents = {};
      }, 0);
    };
    return sendEventForHits;
  }
  function createBindEventForHits(_ref3) {
    var getIndex = _ref3.getIndex, widgetType = _ref3.widgetType, instantSearchInstance = _ref3.instantSearchInstance;
    var bindEventForHits = function bindEventForHits2() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      var payloads = _buildEventPayloadsForHits({
        widgetType,
        getIndex,
        methodName: "bindEvent",
        args,
        instantSearchInstance
      });
      return payloads.length ? "data-insights-event=".concat(serializePayload(payloads)) : "";
    };
    return bindEventForHits;
  }

  // node_modules/instantsearch.js/es/lib/utils/isIndexWidget.js
  function isIndexWidget(widget) {
    return widget.$$type === "ais.index";
  }

  // node_modules/instantsearch.js/es/lib/utils/setIndexHelperState.js
  function setIndexHelperState(finalUiState, indexWidget) {
    var nextIndexUiState = finalUiState[indexWidget.getIndexId()] || {};
    if (true) {
      checkIndexUiState({
        index: indexWidget,
        indexUiState: nextIndexUiState
      });
    }
    indexWidget.getHelper().setState(indexWidget.getWidgetSearchParameters(indexWidget.getHelper().state, {
      uiState: nextIndexUiState
    }));
    indexWidget.getWidgets().filter(isIndexWidget).forEach(function(widget) {
      return setIndexHelperState(finalUiState, widget);
    });
  }

  // node_modules/instantsearch.js/es/lib/utils/debounce.js
  function debounce(func, wait) {
    var lastTimeout = null;
    return function() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return new Promise(function(resolve, reject) {
        if (lastTimeout) {
          clearTimeout(lastTimeout);
        }
        lastTimeout = setTimeout(function() {
          lastTimeout = null;
          Promise.resolve(func.apply(void 0, args)).then(resolve).catch(reject);
        }, wait);
      });
    };
  }

  // node_modules/instantsearch.js/es/lib/utils/defer.js
  var nextMicroTask = Promise.resolve();
  function defer(callback) {
    var progress = null;
    var cancelled = false;
    var fn = function fn2() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      if (progress !== null) {
        return;
      }
      progress = nextMicroTask.then(function() {
        progress = null;
        if (cancelled) {
          cancelled = false;
          return;
        }
        callback.apply(void 0, args);
      });
    };
    fn.wait = function() {
      if (progress === null) {
        throw new Error("The deferred function should be called before calling `wait()`");
      }
      return progress;
    };
    fn.cancel = function() {
      if (progress === null) {
        return;
      }
      cancelled = true;
    };
    return fn;
  }

  // node_modules/instantsearch.js/es/lib/utils/documentation.js
  function createDocumentationLink(_ref) {
    var name = _ref.name, _ref$connector = _ref.connector, connector = _ref$connector === void 0 ? false : _ref$connector;
    return ["https://www.algolia.com/doc/api-reference/widgets/", name, "/js/", connector ? "#connector" : ""].join("");
  }
  function createDocumentationMessageGenerator() {
    for (var _len = arguments.length, widgets = new Array(_len), _key = 0; _key < _len; _key++) {
      widgets[_key] = arguments[_key];
    }
    var links = widgets.map(function(widget) {
      return createDocumentationLink(widget);
    }).join(", ");
    return function(message) {
      return [message, "See documentation: ".concat(links)].filter(Boolean).join("\n\n");
    };
  }

  // node_modules/instantsearch.js/es/lib/utils/find.js
  function find(items, predicate) {
    var value;
    for (var i2 = 0; i2 < items.length; i2++) {
      value = items[i2];
      if (predicate(value, i2, items)) {
        return value;
      }
    }
    return void 0;
  }

  // node_modules/instantsearch.js/es/lib/utils/findIndex.js
  function findIndex(array, comparator) {
    if (!Array.isArray(array)) {
      return -1;
    }
    for (var i2 = 0; i2 < array.length; i2++) {
      if (comparator(array[i2])) {
        return i2;
      }
    }
    return -1;
  }

  // node_modules/instantsearch.js/es/lib/utils/getAppIdAndApiKey.js
  function getAppIdAndApiKey(searchClient2) {
    if (searchClient2.transporter) {
      var _searchClient$transpo = searchClient2.transporter, headers = _searchClient$transpo.headers, queryParameters = _searchClient$transpo.queryParameters;
      var APP_ID = "x-algolia-application-id";
      var API_KEY = "x-algolia-api-key";
      var appId = headers[APP_ID] || queryParameters[APP_ID];
      var apiKey = headers[API_KEY] || queryParameters[API_KEY];
      return [appId, apiKey];
    } else {
      return [searchClient2.applicationID, searchClient2.apiKey];
    }
  }

  // node_modules/instantsearch.js/es/lib/utils/isDomElement.js
  function isDomElement(object) {
    return object instanceof HTMLElement || Boolean(object) && object.nodeType > 0;
  }

  // node_modules/instantsearch.js/es/lib/utils/getContainerNode.js
  function getContainerNode(selectorOrHTMLElement) {
    var isSelectorString = typeof selectorOrHTMLElement === "string";
    var domElement = isSelectorString ? document.querySelector(selectorOrHTMLElement) : selectorOrHTMLElement;
    if (!isDomElement(domElement)) {
      var errorMessage = "Container must be `string` or `HTMLElement`.";
      if (isSelectorString) {
        errorMessage += " Unable to find ".concat(selectorOrHTMLElement);
      }
      throw new Error(errorMessage);
    }
    return domElement;
  }

  // node_modules/instantsearch.js/es/lib/utils/getHighlightedParts.js
  function getHighlightedParts(highlightedValue) {
    var highlightPostTag = TAG_REPLACEMENT.highlightPostTag, highlightPreTag = TAG_REPLACEMENT.highlightPreTag;
    var splitByPreTag = highlightedValue.split(highlightPreTag);
    var firstValue = splitByPreTag.shift();
    var elements = !firstValue ? [] : [{
      value: firstValue,
      isHighlighted: false
    }];
    splitByPreTag.forEach(function(split) {
      var splitByPostTag = split.split(highlightPostTag);
      elements.push({
        value: splitByPostTag[0],
        isHighlighted: true
      });
      if (splitByPostTag[1] !== "") {
        elements.push({
          value: splitByPostTag[1],
          isHighlighted: false
        });
      }
    });
    return elements;
  }

  // node_modules/instantsearch.js/es/lib/utils/getHighlightFromSiblings.js
  var hasAlphanumeric = new RegExp(/\w/i);
  function getHighlightFromSiblings(parts, i2) {
    var _parts, _parts2;
    var current = parts[i2];
    var isNextHighlighted = ((_parts = parts[i2 + 1]) === null || _parts === void 0 ? void 0 : _parts.isHighlighted) || true;
    var isPreviousHighlighted = ((_parts2 = parts[i2 - 1]) === null || _parts2 === void 0 ? void 0 : _parts2.isHighlighted) || true;
    if (!hasAlphanumeric.test(unescape2(current.value)) && isPreviousHighlighted === isNextHighlighted) {
      return isPreviousHighlighted;
    }
    return current.isHighlighted;
  }

  // node_modules/instantsearch.js/es/lib/utils/getPropertyByPath.js
  function getPropertyByPath(object, path) {
    var parts = Array.isArray(path) ? path : path.split(".");
    return parts.reduce(function(current, key2) {
      return current && current[key2];
    }, object);
  }

  // node_modules/instantsearch.js/es/lib/utils/getWidgetAttribute.js
  function getWidgetAttribute(widget, initOptions) {
    var _widget$getWidgetRend;
    var renderState = (_widget$getWidgetRend = widget.getWidgetRenderState) === null || _widget$getWidgetRend === void 0 ? void 0 : _widget$getWidgetRend.call(widget, initOptions);
    var attribute = null;
    if (renderState && renderState.widgetParams) {
      var widgetParams = renderState.widgetParams;
      if (widgetParams.attribute) {
        attribute = widgetParams.attribute;
      } else if (Array.isArray(widgetParams.attributes)) {
        attribute = widgetParams.attributes[0];
      }
    }
    if (typeof attribute !== "string") {
      throw new Error("Could not find the attribute of the widget:\n\n".concat(JSON.stringify(widget), "\n\nPlease check whether the widget's getWidgetRenderState returns widgetParams.attribute correctly."));
    }
    return attribute;
  }

  // node_modules/instantsearch.js/es/lib/utils/hits-absolute-position.js
  function _typeof4(obj) {
    "@babel/helpers - typeof";
    return _typeof4 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof4(obj);
  }
  function ownKeys3(object, enumerableOnly) {
    var keys2 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys2.push.apply(keys2, symbols);
    }
    return keys2;
  }
  function _objectSpread3(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys3(Object(source), true).forEach(function(key2) {
        _defineProperty3(target, key2, source[key2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys3(Object(source)).forEach(function(key2) {
        Object.defineProperty(target, key2, Object.getOwnPropertyDescriptor(source, key2));
      });
    }
    return target;
  }
  function _defineProperty3(obj, key2, value) {
    key2 = _toPropertyKey3(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey3(arg) {
    var key2 = _toPrimitive3(arg, "string");
    return _typeof4(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive3(input, hint) {
    if (_typeof4(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof4(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function addAbsolutePosition(hits2, page, hitsPerPage) {
    return hits2.map(function(hit, idx) {
      return _objectSpread3(_objectSpread3({}, hit), {}, {
        __position: hitsPerPage * page + idx + 1
      });
    });
  }

  // node_modules/instantsearch.js/es/lib/utils/hits-query-id.js
  function _typeof5(obj) {
    "@babel/helpers - typeof";
    return _typeof5 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof5(obj);
  }
  function ownKeys4(object, enumerableOnly) {
    var keys2 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys2.push.apply(keys2, symbols);
    }
    return keys2;
  }
  function _objectSpread4(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys4(Object(source), true).forEach(function(key2) {
        _defineProperty4(target, key2, source[key2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys4(Object(source)).forEach(function(key2) {
        Object.defineProperty(target, key2, Object.getOwnPropertyDescriptor(source, key2));
      });
    }
    return target;
  }
  function _defineProperty4(obj, key2, value) {
    key2 = _toPropertyKey4(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey4(arg) {
    var key2 = _toPrimitive4(arg, "string");
    return _typeof5(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive4(input, hint) {
    if (_typeof5(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof5(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function addQueryID(hits2, queryID) {
    if (!queryID) {
      return hits2;
    }
    return hits2.map(function(hit) {
      return _objectSpread4(_objectSpread4({}, hit), {}, {
        __queryID: queryID
      });
    });
  }

  // node_modules/instantsearch.js/es/lib/utils/hydrateRecommendCache.js
  function _typeof6(obj) {
    "@babel/helpers - typeof";
    return _typeof6 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof6(obj);
  }
  function ownKeys5(object, enumerableOnly) {
    var keys2 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys2.push.apply(keys2, symbols);
    }
    return keys2;
  }
  function _objectSpread5(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys5(Object(source), true).forEach(function(key2) {
        _defineProperty5(target, key2, source[key2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys5(Object(source)).forEach(function(key2) {
        Object.defineProperty(target, key2, Object.getOwnPropertyDescriptor(source, key2));
      });
    }
    return target;
  }
  function _defineProperty5(obj, key2, value) {
    key2 = _toPropertyKey5(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey5(arg) {
    var key2 = _toPrimitive5(arg, "string");
    return _typeof6(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive5(input, hint) {
    if (_typeof6(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof6(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function hydrateRecommendCache(helper, initialResults) {
    var recommendCache = Object.keys(initialResults).reduce(function(acc, indexName) {
      var initialResult = initialResults[indexName];
      if (initialResult.recommendResults) {
        return _objectSpread5(_objectSpread5({}, acc), initialResult.recommendResults.results);
      }
      return acc;
    }, {});
    helper._recommendCache = recommendCache;
  }

  // node_modules/instantsearch.js/es/lib/utils/hydrateSearchClient.js
  function _typeof7(obj) {
    "@babel/helpers - typeof";
    return _typeof7 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof7(obj);
  }
  function _slicedToArray3(arr, i2) {
    return _arrayWithHoles3(arr) || _iterableToArrayLimit3(arr, i2) || _unsupportedIterableToArray3(arr, i2) || _nonIterableRest3();
  }
  function _nonIterableRest3() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray3(o2, minLen) {
    if (!o2) return;
    if (typeof o2 === "string") return _arrayLikeToArray3(o2, minLen);
    var n3 = Object.prototype.toString.call(o2).slice(8, -1);
    if (n3 === "Object" && o2.constructor) n3 = o2.constructor.name;
    if (n3 === "Map" || n3 === "Set") return Array.from(o2);
    if (n3 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n3)) return _arrayLikeToArray3(o2, minLen);
  }
  function _arrayLikeToArray3(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i2 = 0, arr2 = new Array(len); i2 < len; i2++) arr2[i2] = arr[i2];
    return arr2;
  }
  function _iterableToArrayLimit3(arr, i2) {
    var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
    if (null != _i) {
      var _s, _e, _x, _r, _arr = [], _n = true, _d = false;
      try {
        if (_x = (_i = _i.call(arr)).next, 0 === i2) {
          if (Object(_i) !== _i) return;
          _n = false;
        } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i2); _n = true) ;
      } catch (err) {
        _d = true, _e = err;
      } finally {
        try {
          if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
  }
  function _arrayWithHoles3(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function ownKeys6(object, enumerableOnly) {
    var keys2 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys2.push.apply(keys2, symbols);
    }
    return keys2;
  }
  function _objectSpread6(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys6(Object(source), true).forEach(function(key2) {
        _defineProperty6(target, key2, source[key2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys6(Object(source)).forEach(function(key2) {
        Object.defineProperty(target, key2, Object.getOwnPropertyDescriptor(source, key2));
      });
    }
    return target;
  }
  function _defineProperty6(obj, key2, value) {
    key2 = _toPropertyKey6(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey6(arg) {
    var key2 = _toPrimitive6(arg, "string");
    return _typeof7(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive6(input, hint) {
    if (_typeof7(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof7(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function hydrateSearchClient(client, results) {
    if (!results) {
      return;
    }
    if ((!("transporter" in client) || client._cacheHydrated) && (!client._useCache || typeof client.addAlgoliaAgent !== "function")) {
      return;
    }
    var cachedRequest = Object.keys(results).map(function(key2) {
      var _results$key = results[key2], state = _results$key.state, requestParams = _results$key.requestParams, serverResults = _results$key.results;
      return serverResults && state ? serverResults.map(function(result) {
        return _objectSpread6({
          indexName: state.index || result.index
        }, requestParams || result.params ? {
          params: serializeQueryParameters(requestParams || deserializeQueryParameters(result.params))
        } : {});
      }) : [];
    });
    var cachedResults = Object.keys(results).reduce(function(acc, key2) {
      var res = results[key2].results;
      if (!res) {
        return acc;
      }
      return acc.concat(res);
    }, []);
    if ("transporter" in client && !client._cacheHydrated) {
      client._cacheHydrated = true;
      var baseMethod = client.search;
      client.search = function(requests) {
        for (var _len = arguments.length, methodArgs = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          methodArgs[_key - 1] = arguments[_key];
        }
        var requestsWithSerializedParams = requests.map(function(request) {
          return _objectSpread6(_objectSpread6({}, request), {}, {
            params: serializeQueryParameters(request.params)
          });
        });
        return client.transporter.responsesCache.get({
          method: "search",
          args: [requestsWithSerializedParams].concat(methodArgs)
        }, function() {
          return baseMethod.apply(void 0, [requests].concat(methodArgs));
        });
      };
      client.transporter.responsesCache.set({
        method: "search",
        args: cachedRequest
      }, {
        results: cachedResults
      });
    }
    if (!("transporter" in client)) {
      var cacheKey = "/1/indexes/*/queries_body_".concat(JSON.stringify({
        requests: cachedRequest
      }));
      client.cache = _objectSpread6(_objectSpread6({}, client.cache), {}, _defineProperty6({}, cacheKey, JSON.stringify({
        results: Object.keys(results).map(function(key2) {
          return results[key2].results;
        })
      })));
    }
  }
  function deserializeQueryParameters(parameters) {
    return parameters.split("&").reduce(function(acc, parameter) {
      var _parameter$split = parameter.split("="), _parameter$split2 = _slicedToArray3(_parameter$split, 2), key2 = _parameter$split2[0], value = _parameter$split2[1];
      acc[key2] = value ? decodeURIComponent(value) : "";
      return acc;
    }, {});
  }
  function serializeQueryParameters(parameters) {
    var isObjectOrArray = function isObjectOrArray2(value) {
      return Object.prototype.toString.call(value) === "[object Object]" || Object.prototype.toString.call(value) === "[object Array]";
    };
    var encode = function encode2(format) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }
      var i2 = 0;
      return format.replace(/%s/g, function() {
        return encodeURIComponent(args[i2++]);
      });
    };
    return Object.keys(parameters).map(function(key2) {
      return encode("%s=%s", key2, isObjectOrArray(parameters[key2]) ? JSON.stringify(parameters[key2]) : parameters[key2]);
    }).join("&");
  }

  // node_modules/instantsearch.js/es/lib/utils/isEqual.js
  function isPrimitive(obj) {
    return obj !== Object(obj);
  }
  function isEqual(first, second) {
    if (first === second) {
      return true;
    }
    if (isPrimitive(first) || isPrimitive(second) || typeof first === "function" || typeof second === "function") {
      return first === second;
    }
    if (Object.keys(first).length !== Object.keys(second).length) {
      return false;
    }
    for (var _i = 0, _Object$keys = Object.keys(first); _i < _Object$keys.length; _i++) {
      var key2 = _Object$keys[_i];
      if (!(key2 in second)) {
        return false;
      }
      if (!isEqual(first[key2], second[key2])) {
        return false;
      }
    }
    return true;
  }

  // node_modules/instantsearch.js/es/lib/utils/uniq.js
  function uniq(array) {
    return array.filter(function(value, index3, self2) {
      return self2.indexOf(value) === index3;
    });
  }

  // node_modules/instantsearch.js/es/lib/utils/mergeSearchParameters.js
  function _typeof8(obj) {
    "@babel/helpers - typeof";
    return _typeof8 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof8(obj);
  }
  var _excluded = ["facets", "disjunctiveFacets", "facetsRefinements", "facetsExcludes", "disjunctiveFacetsRefinements", "numericRefinements", "tagRefinements", "hierarchicalFacets", "hierarchicalFacetsRefinements", "ruleContexts"];
  function ownKeys7(object, enumerableOnly) {
    var keys2 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys2.push.apply(keys2, symbols);
    }
    return keys2;
  }
  function _objectSpread7(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys7(Object(source), true).forEach(function(key2) {
        _defineProperty7(target, key2, source[key2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys7(Object(source)).forEach(function(key2) {
        Object.defineProperty(target, key2, Object.getOwnPropertyDescriptor(source, key2));
      });
    }
    return target;
  }
  function _defineProperty7(obj, key2, value) {
    key2 = _toPropertyKey7(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey7(arg) {
    var key2 = _toPrimitive7(arg, "string");
    return _typeof8(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive7(input, hint) {
    if (_typeof8(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof8(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _objectWithoutProperties(source, excluded) {
    if (source == null) return {};
    var target = _objectWithoutPropertiesLoose(source, excluded);
    var key2, i2;
    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i2 = 0; i2 < sourceSymbolKeys.length; i2++) {
        key2 = sourceSymbolKeys[i2];
        if (excluded.indexOf(key2) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key2)) continue;
        target[key2] = source[key2];
      }
    }
    return target;
  }
  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key2, i2;
    for (i2 = 0; i2 < sourceKeys.length; i2++) {
      key2 = sourceKeys[i2];
      if (excluded.indexOf(key2) >= 0) continue;
      target[key2] = source[key2];
    }
    return target;
  }
  var mergeWithRest = function mergeWithRest2(left, right) {
    var facets = right.facets, disjunctiveFacets = right.disjunctiveFacets, facetsRefinements = right.facetsRefinements, facetsExcludes = right.facetsExcludes, disjunctiveFacetsRefinements = right.disjunctiveFacetsRefinements, numericRefinements = right.numericRefinements, tagRefinements = right.tagRefinements, hierarchicalFacets = right.hierarchicalFacets, hierarchicalFacetsRefinements = right.hierarchicalFacetsRefinements, ruleContexts = right.ruleContexts, rest = _objectWithoutProperties(right, _excluded);
    return left.setQueryParameters(rest);
  };
  var mergeFacets = function mergeFacets2(left, right) {
    return right.facets.reduce(function(_2, name) {
      return _2.addFacet(name);
    }, left);
  };
  var mergeDisjunctiveFacets = function mergeDisjunctiveFacets2(left, right) {
    return right.disjunctiveFacets.reduce(function(_2, name) {
      return _2.addDisjunctiveFacet(name);
    }, left);
  };
  var mergeHierarchicalFacets = function mergeHierarchicalFacets2(left, right) {
    return left.setQueryParameters({
      hierarchicalFacets: right.hierarchicalFacets.reduce(function(facets, facet) {
        var index3 = findIndex(facets, function(_2) {
          return _2.name === facet.name;
        });
        if (index3 === -1) {
          return facets.concat(facet);
        }
        var nextFacets = facets.slice();
        nextFacets.splice(index3, 1, facet);
        return nextFacets;
      }, left.hierarchicalFacets)
    });
  };
  var mergeTagRefinements = function mergeTagRefinements2(left, right) {
    return right.tagRefinements.reduce(function(_2, value) {
      return _2.addTagRefinement(value);
    }, left);
  };
  var mergeFacetRefinements = function mergeFacetRefinements2(left, right) {
    return left.setQueryParameters({
      facetsRefinements: _objectSpread7(_objectSpread7({}, left.facetsRefinements), right.facetsRefinements)
    });
  };
  var mergeFacetsExcludes = function mergeFacetsExcludes2(left, right) {
    return left.setQueryParameters({
      facetsExcludes: _objectSpread7(_objectSpread7({}, left.facetsExcludes), right.facetsExcludes)
    });
  };
  var mergeDisjunctiveFacetsRefinements = function mergeDisjunctiveFacetsRefinements2(left, right) {
    return left.setQueryParameters({
      disjunctiveFacetsRefinements: _objectSpread7(_objectSpread7({}, left.disjunctiveFacetsRefinements), right.disjunctiveFacetsRefinements)
    });
  };
  var mergeNumericRefinements = function mergeNumericRefinements2(left, right) {
    return left.setQueryParameters({
      numericRefinements: _objectSpread7(_objectSpread7({}, left.numericRefinements), right.numericRefinements)
    });
  };
  var mergeHierarchicalFacetsRefinements = function mergeHierarchicalFacetsRefinements2(left, right) {
    return left.setQueryParameters({
      hierarchicalFacetsRefinements: _objectSpread7(_objectSpread7({}, left.hierarchicalFacetsRefinements), right.hierarchicalFacetsRefinements)
    });
  };
  var mergeRuleContexts = function mergeRuleContexts2(left, right) {
    var ruleContexts = uniq([].concat(left.ruleContexts).concat(right.ruleContexts).filter(Boolean));
    if (ruleContexts.length > 0) {
      return left.setQueryParameters({
        ruleContexts
      });
    }
    return left;
  };
  var mergeSearchParameters = function mergeSearchParameters2() {
    for (var _len = arguments.length, parameters = new Array(_len), _key = 0; _key < _len; _key++) {
      parameters[_key] = arguments[_key];
    }
    return parameters.reduce(function(left, right) {
      var hierarchicalFacetsRefinementsMerged = mergeHierarchicalFacetsRefinements(left, right);
      var hierarchicalFacetsMerged = mergeHierarchicalFacets(hierarchicalFacetsRefinementsMerged, right);
      var tagRefinementsMerged = mergeTagRefinements(hierarchicalFacetsMerged, right);
      var numericRefinementsMerged = mergeNumericRefinements(tagRefinementsMerged, right);
      var disjunctiveFacetsRefinementsMerged = mergeDisjunctiveFacetsRefinements(numericRefinementsMerged, right);
      var facetsExcludesMerged = mergeFacetsExcludes(disjunctiveFacetsRefinementsMerged, right);
      var facetRefinementsMerged = mergeFacetRefinements(facetsExcludesMerged, right);
      var disjunctiveFacetsMerged = mergeDisjunctiveFacets(facetRefinementsMerged, right);
      var ruleContextsMerged = mergeRuleContexts(disjunctiveFacetsMerged, right);
      var facetsMerged = mergeFacets(ruleContextsMerged, right);
      return mergeWithRest(facetsMerged, right);
    });
  };

  // node_modules/instantsearch.js/es/lib/utils/omit.js
  function omit(source, excluded) {
    if (source === null || source === void 0) {
      return source;
    }
    return Object.keys(source).reduce(function(target, key2) {
      if (excluded.indexOf(key2) >= 0) {
        return target;
      }
      var validKey = key2;
      target[validKey] = source[validKey];
      return target;
    }, {});
  }

  // node_modules/instantsearch.js/es/lib/utils/render-args.js
  function createInitArgs(instantSearchInstance, parent, uiState) {
    var helper = parent.getHelper();
    return {
      uiState,
      helper,
      parent,
      instantSearchInstance,
      state: helper.state,
      renderState: instantSearchInstance.renderState,
      templatesConfig: instantSearchInstance.templatesConfig,
      createURL: parent.createURL,
      scopedResults: [],
      searchMetadata: {
        isSearchStalled: instantSearchInstance.status === "stalled"
      },
      status: instantSearchInstance.status,
      error: instantSearchInstance.error
    };
  }
  function createRenderArgs(instantSearchInstance, parent, widget) {
    var results = parent.getResultsForWidget(widget);
    var helper = parent.getHelper();
    return {
      helper,
      parent,
      instantSearchInstance,
      results,
      scopedResults: parent.getScopedResults(),
      state: results && "_state" in results ? results._state : helper.state,
      renderState: instantSearchInstance.renderState,
      templatesConfig: instantSearchInstance.templatesConfig,
      createURL: parent.createURL,
      searchMetadata: {
        isSearchStalled: instantSearchInstance.status === "stalled"
      },
      status: instantSearchInstance.status,
      error: instantSearchInstance.error
    };
  }

  // node_modules/instantsearch.js/es/lib/utils/resolveSearchParameters.js
  function resolveSearchParameters(current) {
    var parent = current.getParent();
    var states = [current.getHelper().state];
    while (parent !== null) {
      states = [parent.getHelper().state].concat(states);
      parent = parent.getParent();
    }
    return states;
  }

  // node_modules/instantsearch.js/es/lib/utils/reverseHighlightedParts.js
  function _typeof9(obj) {
    "@babel/helpers - typeof";
    return _typeof9 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof9(obj);
  }
  function ownKeys8(object, enumerableOnly) {
    var keys2 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys2.push.apply(keys2, symbols);
    }
    return keys2;
  }
  function _objectSpread8(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys8(Object(source), true).forEach(function(key2) {
        _defineProperty8(target, key2, source[key2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys8(Object(source)).forEach(function(key2) {
        Object.defineProperty(target, key2, Object.getOwnPropertyDescriptor(source, key2));
      });
    }
    return target;
  }
  function _defineProperty8(obj, key2, value) {
    key2 = _toPropertyKey8(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey8(arg) {
    var key2 = _toPrimitive8(arg, "string");
    return _typeof9(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive8(input, hint) {
    if (_typeof9(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof9(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function reverseHighlightedParts(parts) {
    if (!parts.some(function(part) {
      return part.isHighlighted;
    })) {
      return parts.map(function(part) {
        return _objectSpread8(_objectSpread8({}, part), {}, {
          isHighlighted: false
        });
      });
    }
    return parts.map(function(part, i2) {
      return _objectSpread8(_objectSpread8({}, part), {}, {
        isHighlighted: !getHighlightFromSiblings(parts, i2)
      });
    });
  }

  // node_modules/instantsearch.js/es/lib/utils/safelyRunOnBrowser.js
  function safelyRunOnBrowser(callback) {
    var _ref = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {
      fallback: function fallback2() {
        return void 0;
      }
    }, fallback = _ref.fallback;
    if (typeof window === "undefined") {
      return fallback();
    }
    return callback({
      window
    });
  }

  // node_modules/instantsearch.js/es/lib/utils/toArray.js
  function toArray(value) {
    return Array.isArray(value) ? value : [value];
  }

  // node_modules/instantsearch.js/es/helpers/highlight.js
  var suit = component("Highlight");
  function highlight(_ref) {
    var attribute = _ref.attribute, _ref$highlightedTagNa = _ref.highlightedTagName, highlightedTagName = _ref$highlightedTagNa === void 0 ? "mark" : _ref$highlightedTagNa, hit = _ref.hit, _ref$cssClasses = _ref.cssClasses, cssClasses = _ref$cssClasses === void 0 ? {} : _ref$cssClasses;
    true ? _warning(false, "`instantsearch.highlight` function has been deprecated. It is still supported in 4.x releases, but not further. It is replaced by the `Highlight` component.\n\nFor more information, visit https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/js/?client=html+tagged+templates#upgrade-templates") : void 0;
    var highlightAttributeResult = getPropertyByPath(hit._highlightResult, attribute);
    true ? _warning(highlightAttributeResult, 'Could not enable highlight for "'.concat(attribute, '", will display an empty string.\nPlease check whether this attribute exists and is either searchable or specified in `attributesToHighlight`.\n\nSee: https://alg.li/highlighting\n')) : void 0;
    var _ref2 = highlightAttributeResult || {}, _ref2$value = _ref2.value, attributeValue = _ref2$value === void 0 ? "" : _ref2$value;
    var className = suit({
      descendantName: "highlighted"
    }) + (cssClasses.highlighted ? " ".concat(cssClasses.highlighted) : "");
    return attributeValue.replace(new RegExp(TAG_REPLACEMENT.highlightPreTag, "g"), "<".concat(highlightedTagName, ' class="').concat(className, '">')).replace(new RegExp(TAG_REPLACEMENT.highlightPostTag, "g"), "</".concat(highlightedTagName, ">"));
  }

  // node_modules/instantsearch.js/es/helpers/reverseHighlight.js
  var suit2 = component("ReverseHighlight");
  function reverseHighlight(_ref) {
    var attribute = _ref.attribute, _ref$highlightedTagNa = _ref.highlightedTagName, highlightedTagName = _ref$highlightedTagNa === void 0 ? "mark" : _ref$highlightedTagNa, hit = _ref.hit, _ref$cssClasses = _ref.cssClasses, cssClasses = _ref$cssClasses === void 0 ? {} : _ref$cssClasses;
    true ? _warning(false, "`instantsearch.reverseHighlight` function has been deprecated. It is still supported in 4.x releases, but not further. It is replaced by the `ReverseHighlight` component.\n\nFor more information, visit https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/js/?client=html+tagged+templates#upgrade-templates") : void 0;
    var highlightAttributeResult = getPropertyByPath(hit._highlightResult, attribute);
    true ? _warning(highlightAttributeResult, 'Could not enable reverse highlight for "'.concat(attribute, '", will display an empty string.\nPlease check whether this attribute exists and is either searchable or specified in `attributesToHighlight`.\n\nSee: https://alg.li/highlighting\n')) : void 0;
    var _ref2 = highlightAttributeResult || {}, _ref2$value = _ref2.value, attributeValue = _ref2$value === void 0 ? "" : _ref2$value;
    var className = suit2({
      descendantName: "highlighted"
    }) + (cssClasses.highlighted ? " ".concat(cssClasses.highlighted) : "");
    var reverseHighlightedValue = concatHighlightedParts(reverseHighlightedParts(getHighlightedParts(attributeValue)));
    return reverseHighlightedValue.replace(new RegExp(TAG_REPLACEMENT.highlightPreTag, "g"), "<".concat(highlightedTagName, ' class="').concat(className, '">')).replace(new RegExp(TAG_REPLACEMENT.highlightPostTag, "g"), "</".concat(highlightedTagName, ">"));
  }

  // node_modules/instantsearch.js/es/helpers/snippet.js
  var suit3 = component("Snippet");
  function snippet(_ref) {
    var attribute = _ref.attribute, _ref$highlightedTagNa = _ref.highlightedTagName, highlightedTagName = _ref$highlightedTagNa === void 0 ? "mark" : _ref$highlightedTagNa, hit = _ref.hit, _ref$cssClasses = _ref.cssClasses, cssClasses = _ref$cssClasses === void 0 ? {} : _ref$cssClasses;
    true ? _warning(false, "`instantsearch.snippet` function has been deprecated. It is still supported in 4.x releases, but not further. It is replaced by the `Snippet` component.\n\nFor more information, visit https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/js/?client=html+tagged+templates#upgrade-templates") : void 0;
    var snippetAttributeResult = getPropertyByPath(hit._snippetResult, attribute);
    true ? _warning(snippetAttributeResult, 'Could not enable snippet for "'.concat(attribute, '", will display an empty string.\nPlease check whether this attribute exists and is specified in `attributesToSnippet`.\n\nSee: https://alg.li/highlighting\n')) : void 0;
    var _ref2 = snippetAttributeResult || {}, _ref2$value = _ref2.value, attributeValue = _ref2$value === void 0 ? "" : _ref2$value;
    var className = suit3({
      descendantName: "highlighted"
    }) + (cssClasses.highlighted ? " ".concat(cssClasses.highlighted) : "");
    return attributeValue.replace(new RegExp(TAG_REPLACEMENT.highlightPreTag, "g"), "<".concat(highlightedTagName, ' class="').concat(className, '">')).replace(new RegExp(TAG_REPLACEMENT.highlightPostTag, "g"), "</".concat(highlightedTagName, ">"));
  }

  // node_modules/instantsearch.js/es/helpers/reverseSnippet.js
  var suit4 = component("ReverseSnippet");
  function reverseSnippet(_ref) {
    var attribute = _ref.attribute, _ref$highlightedTagNa = _ref.highlightedTagName, highlightedTagName = _ref$highlightedTagNa === void 0 ? "mark" : _ref$highlightedTagNa, hit = _ref.hit, _ref$cssClasses = _ref.cssClasses, cssClasses = _ref$cssClasses === void 0 ? {} : _ref$cssClasses;
    true ? _warning(false, "`instantsearch.reverseSnippet` function has been deprecated. It is still supported in 4.x releases, but not further. It is replaced by the `ReverseSnippet` component.\n\nFor more information, visit https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/js/?client=html+tagged+templates#upgrade-templates") : void 0;
    var snippetAttributeResult = getPropertyByPath(hit._snippetResult, attribute);
    true ? _warning(snippetAttributeResult, 'Could not enable reverse snippet for "'.concat(attribute, '", will display an empty string.\nPlease check whether this attribute exists and is specified in `attributesToSnippet`.\n\nSee: https://alg.li/highlighting\n')) : void 0;
    var _ref2 = snippetAttributeResult || {}, _ref2$value = _ref2.value, attributeValue = _ref2$value === void 0 ? "" : _ref2$value;
    var className = suit4({
      descendantName: "highlighted"
    }) + (cssClasses.highlighted ? " ".concat(cssClasses.highlighted) : "");
    var reverseHighlightedValue = concatHighlightedParts(reverseHighlightedParts(getHighlightedParts(attributeValue)));
    return reverseHighlightedValue.replace(new RegExp(TAG_REPLACEMENT.highlightPreTag, "g"), "<".concat(highlightedTagName, ' class="').concat(className, '">')).replace(new RegExp(TAG_REPLACEMENT.highlightPostTag, "g"), "</".concat(highlightedTagName, ">"));
  }

  // node_modules/instantsearch.js/es/helpers/insights.js
  function _typeof10(obj) {
    "@babel/helpers - typeof";
    return _typeof10 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof10(obj);
  }
  function readDataAttributes(domElement) {
    var method = domElement.getAttribute("data-insights-method");
    var serializedPayload = domElement.getAttribute("data-insights-payload");
    if (typeof serializedPayload !== "string") {
      throw new Error("The insights helper expects `data-insights-payload` to be a base64-encoded JSON string.");
    }
    try {
      var payload = deserializePayload(serializedPayload);
      return {
        method,
        payload
      };
    } catch (error) {
      throw new Error("The insights helper was unable to parse `data-insights-payload`.");
    }
  }
  function writeDataAttributes(_ref) {
    var method = _ref.method, payload = _ref.payload;
    if (_typeof10(payload) !== "object") {
      throw new Error("The insights helper expects the payload to be an object.");
    }
    var serializedPayload;
    try {
      serializedPayload = serializePayload(payload);
    } catch (error) {
      throw new Error("Could not JSON serialize the payload object.");
    }
    return 'data-insights-method="'.concat(method, '" data-insights-payload="').concat(serializedPayload, '"');
  }
  function insights(method, payload) {
    true ? _warning(false, "`insights` function has been deprecated. It is still supported in 4.x releases, but not further. It is replaced by the `insights` middleware.\n\nFor more information, visit https://www.algolia.com/doc/guides/getting-insights-and-analytics/search-analytics/click-through-and-conversions/how-to/send-click-and-conversion-events-with-instantsearch/js/") : void 0;
    return writeDataAttributes({
      method,
      payload
    });
  }

  // node_modules/instantsearch.js/es/helpers/get-insights-anonymous-user-token.js
  function _typeof11(obj) {
    "@babel/helpers - typeof";
    return _typeof11 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof11(obj);
  }
  var ANONYMOUS_TOKEN_COOKIE_KEY = "_ALGOLIA";
  function getCookie(name) {
    if ((typeof document === "undefined" ? "undefined" : _typeof11(document)) !== "object" || typeof document.cookie !== "string") {
      return void 0;
    }
    var prefix = "".concat(name, "=");
    var cookies = document.cookie.split(";");
    for (var i2 = 0; i2 < cookies.length; i2++) {
      var cookie = cookies[i2];
      while (cookie.charAt(0) === " ") {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(prefix) === 0) {
        return cookie.substring(prefix.length, cookie.length);
      }
    }
    return void 0;
  }
  function getInsightsAnonymousUserTokenInternal() {
    return getCookie(ANONYMOUS_TOKEN_COOKIE_KEY);
  }
  function getInsightsAnonymousUserToken() {
    true ? _warning(false, "`getInsightsAnonymousUserToken` function has been deprecated. It is still supported in 4.x releases, but not further. It is replaced by the `insights` middleware.\n\nFor more information, visit https://www.algolia.com/doc/guides/getting-insights-and-analytics/search-analytics/click-through-and-conversions/how-to/send-click-and-conversion-events-with-instantsearch/js/") : void 0;
    return getInsightsAnonymousUserTokenInternal();
  }

  // node_modules/instantsearch.js/es/lib/infiniteHitsCache/sessionStorage.js
  var _excluded2 = ["page"];
  function _objectWithoutProperties2(source, excluded) {
    if (source == null) return {};
    var target = _objectWithoutPropertiesLoose2(source, excluded);
    var key2, i2;
    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i2 = 0; i2 < sourceSymbolKeys.length; i2++) {
        key2 = sourceSymbolKeys[i2];
        if (excluded.indexOf(key2) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key2)) continue;
        target[key2] = source[key2];
      }
    }
    return target;
  }
  function _objectWithoutPropertiesLoose2(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key2, i2;
    for (i2 = 0; i2 < sourceKeys.length; i2++) {
      key2 = sourceKeys[i2];
      if (excluded.indexOf(key2) >= 0) continue;
      target[key2] = source[key2];
    }
    return target;
  }
  function getStateWithoutPage(state) {
    var _ref = state || {}, page = _ref.page, rest = _objectWithoutProperties2(_ref, _excluded2);
    return rest;
  }
  var KEY = "ais.infiniteHits";
  function createInfiniteHitsSessionStorageCache() {
    return {
      read: function read(_ref2) {
        var state = _ref2.state;
        var sessionStorage = safelyRunOnBrowser(function(_ref3) {
          var window2 = _ref3.window;
          return window2.sessionStorage;
        });
        if (!sessionStorage) {
          return null;
        }
        try {
          var cache = JSON.parse(
            // @ts-expect-error JSON.parse() requires a string, but it actually accepts null, too.
            sessionStorage.getItem(KEY)
          );
          return cache && isEqual(cache.state, getStateWithoutPage(state)) ? cache.hits : null;
        } catch (error) {
          if (error instanceof SyntaxError) {
            try {
              sessionStorage.removeItem(KEY);
            } catch (err) {
            }
          }
          return null;
        }
      },
      write: function write(_ref4) {
        var state = _ref4.state, hits2 = _ref4.hits;
        var sessionStorage = safelyRunOnBrowser(function(_ref5) {
          var window2 = _ref5.window;
          return window2.sessionStorage;
        });
        if (!sessionStorage) {
          return;
        }
        try {
          sessionStorage.setItem(KEY, JSON.stringify({
            state: getStateWithoutPage(state),
            hits: hits2
          }));
        } catch (error) {
        }
      }
    };
  }

  // node_modules/instantsearch.js/es/lib/InstantSearch.js
  var import_events = __toESM(require_events(), 1);
  var import_algoliasearch_helper2 = __toESM(require_algoliasearch_helper2(), 1);

  // node_modules/instantsearch.js/es/middlewares/createInsightsMiddleware.js
  function _typeof12(obj) {
    "@babel/helpers - typeof";
    return _typeof12 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof12(obj);
  }
  function ownKeys9(object, enumerableOnly) {
    var keys2 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys2.push.apply(keys2, symbols);
    }
    return keys2;
  }
  function _objectSpread9(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys9(Object(source), true).forEach(function(key2) {
        _defineProperty9(target, key2, source[key2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys9(Object(source)).forEach(function(key2) {
        Object.defineProperty(target, key2, Object.getOwnPropertyDescriptor(source, key2));
      });
    }
    return target;
  }
  function _defineProperty9(obj, key2, value) {
    key2 = _toPropertyKey9(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey9(arg) {
    var key2 = _toPrimitive9(arg, "string");
    return _typeof12(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive9(input, hint) {
    if (_typeof12(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof12(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _slicedToArray4(arr, i2) {
    return _arrayWithHoles4(arr) || _iterableToArrayLimit4(arr, i2) || _unsupportedIterableToArray4(arr, i2) || _nonIterableRest4();
  }
  function _nonIterableRest4() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _iterableToArrayLimit4(arr, i2) {
    var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
    if (null != _i) {
      var _s, _e, _x, _r, _arr = [], _n = true, _d = false;
      try {
        if (_x = (_i = _i.call(arr)).next, 0 === i2) {
          if (Object(_i) !== _i) return;
          _n = false;
        } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i2); _n = true) ;
      } catch (err) {
        _d = true, _e = err;
      } finally {
        try {
          if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
  }
  function _arrayWithHoles4(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _toConsumableArray2(arr) {
    return _arrayWithoutHoles2(arr) || _iterableToArray2(arr) || _unsupportedIterableToArray4(arr) || _nonIterableSpread2();
  }
  function _nonIterableSpread2() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray4(o2, minLen) {
    if (!o2) return;
    if (typeof o2 === "string") return _arrayLikeToArray4(o2, minLen);
    var n3 = Object.prototype.toString.call(o2).slice(8, -1);
    if (n3 === "Object" && o2.constructor) n3 = o2.constructor.name;
    if (n3 === "Map" || n3 === "Set") return Array.from(o2);
    if (n3 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n3)) return _arrayLikeToArray4(o2, minLen);
  }
  function _iterableToArray2(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
  function _arrayWithoutHoles2(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray4(arr);
  }
  function _arrayLikeToArray4(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i2 = 0, arr2 = new Array(len); i2 < len; i2++) arr2[i2] = arr[i2];
    return arr2;
  }
  var ALGOLIA_INSIGHTS_VERSION = "2.13.0";
  var ALGOLIA_INSIGHTS_SRC = "https://cdn.jsdelivr.net/npm/search-insights@".concat(ALGOLIA_INSIGHTS_VERSION, "/dist/search-insights.min.js");
  function createInsightsMiddleware() {
    var props = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    var _insightsClient = props.insightsClient, insightsInitParams = props.insightsInitParams, onEvent = props.onEvent, _props$$$internal = props.$$internal, $$internal = _props$$$internal === void 0 ? false : _props$$$internal, _props$$$automatic = props.$$automatic, $$automatic = _props$$$automatic === void 0 ? false : _props$$$automatic;
    var potentialInsightsClient = _insightsClient;
    if (!_insightsClient && _insightsClient !== null) {
      safelyRunOnBrowser(function(_ref) {
        var window2 = _ref.window;
        var pointer = window2.AlgoliaAnalyticsObject || "aa";
        if (typeof pointer === "string") {
          potentialInsightsClient = window2[pointer];
        }
        if (!potentialInsightsClient) {
          window2.AlgoliaAnalyticsObject = pointer;
          if (!window2[pointer]) {
            window2[pointer] = function() {
              if (!window2[pointer].queue) {
                window2[pointer].queue = [];
              }
              for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
              }
              window2[pointer].queue.push(args);
            };
            window2[pointer].version = ALGOLIA_INSIGHTS_VERSION;
            window2[pointer].shouldAddScript = true;
          }
          potentialInsightsClient = window2[pointer];
        }
      });
    }
    var insightsClient = potentialInsightsClient || noop;
    return function(_ref2) {
      var instantSearchInstance = _ref2.instantSearchInstance;
      var existingInsightsMiddlewares = instantSearchInstance.middleware.filter(function(m3) {
        return m3.instance.$$type === "ais.insights" && m3.instance.$$internal;
      }).map(function(m3) {
        return m3.creator;
      });
      instantSearchInstance.unuse.apply(instantSearchInstance, _toConsumableArray2(existingInsightsMiddlewares));
      var _getAppIdAndApiKey = getAppIdAndApiKey(instantSearchInstance.client), _getAppIdAndApiKey2 = _slicedToArray4(_getAppIdAndApiKey, 2), appId = _getAppIdAndApiKey2[0], apiKey = _getAppIdAndApiKey2[1];
      true ? _warning(Boolean(appId && apiKey), "could not extract Algolia credentials from searchClient in insights middleware.") : void 0;
      var queuedUserToken = void 0;
      var queuedAuthenticatedUserToken = void 0;
      var userTokenBeforeInit = void 0;
      var authenticatedUserTokenBeforeInit = void 0;
      var queue = insightsClient.queue;
      if (Array.isArray(queue)) {
        var _map = ["setUserToken", "setAuthenticatedUserToken"].map(function(key2) {
          var _ref3 = find(queue.slice().reverse(), function(_ref5) {
            var _ref6 = _slicedToArray4(_ref5, 1), method = _ref6[0];
            return method === key2;
          }) || [], _ref4 = _slicedToArray4(_ref3, 2), value = _ref4[1];
          return value;
        });
        var _map2 = _slicedToArray4(_map, 2);
        queuedUserToken = _map2[0];
        queuedAuthenticatedUserToken = _map2[1];
      }
      insightsClient("getUserToken", null, function(_error, userToken) {
        userTokenBeforeInit = normalizeUserToken(userToken);
      });
      insightsClient("getAuthenticatedUserToken", null, function(_error, userToken) {
        authenticatedUserTokenBeforeInit = normalizeUserToken(userToken);
      });
      if (insightsInitParams || !isModernInsightsClient(insightsClient)) {
        insightsClient("init", _objectSpread9({
          appId,
          apiKey,
          partial: true
        }, insightsInitParams));
      }
      var initialParameters;
      var helper;
      return {
        $$type: "ais.insights",
        $$internal,
        $$automatic,
        onStateChange: function onStateChange() {
        },
        subscribe: function subscribe() {
          if (!insightsClient.shouldAddScript) return;
          var errorMessage = "[insights middleware]: could not load search-insights.js. Please load it manually following https://alg.li/insights-init";
          try {
            var script = document.createElement("script");
            script.async = true;
            script.src = ALGOLIA_INSIGHTS_SRC;
            script.onerror = function() {
              instantSearchInstance.emit("error", new Error(errorMessage));
            };
            document.body.appendChild(script);
            insightsClient.shouldAddScript = false;
          } catch (cause) {
            insightsClient.shouldAddScript = false;
            instantSearchInstance.emit("error", new Error(errorMessage));
          }
        },
        started: function started() {
          insightsClient("addAlgoliaAgent", "insights-middleware");
          helper = instantSearchInstance.mainHelper;
          initialParameters = {
            userToken: helper.state.userToken,
            clickAnalytics: helper.state.clickAnalytics
          };
          if (!$$automatic) {
            helper.overrideStateWithoutTriggeringChangeEvent(_objectSpread9(_objectSpread9({}, helper.state), {}, {
              clickAnalytics: true
            }));
          }
          if (!$$internal) {
            instantSearchInstance.scheduleSearch();
          }
          var setUserTokenToSearch = function setUserTokenToSearch2(userToken) {
            var immediate = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
            var normalizedUserToken = normalizeUserToken(userToken);
            if (!normalizedUserToken) {
              return;
            }
            var existingToken = helper.state.userToken;
            function applyToken() {
              helper.overrideStateWithoutTriggeringChangeEvent(_objectSpread9(_objectSpread9({}, helper.state), {}, {
                userToken: normalizedUserToken
              }));
              if (existingToken && existingToken !== userToken) {
                instantSearchInstance.scheduleSearch();
              }
            }
            if (!immediate) {
              setTimeout(applyToken, 0);
            } else {
              applyToken();
            }
          };
          var anonymousUserToken = getInsightsAnonymousUserTokenInternal();
          if (anonymousUserToken) {
            setUserTokenToSearch(anonymousUserToken, true);
          }
          function setUserToken(token, userToken, authenticatedUserToken) {
            setUserTokenToSearch(token, true);
            if (userToken) {
              insightsClient("setUserToken", userToken);
            }
            if (authenticatedUserToken) {
              insightsClient("setAuthenticatedUserToken", authenticatedUserToken);
            }
          }
          var tokenBeforeInit = authenticatedUserTokenBeforeInit || userTokenBeforeInit;
          var queuedToken = queuedAuthenticatedUserToken || queuedUserToken;
          if (tokenBeforeInit) {
            setUserToken(tokenBeforeInit, userTokenBeforeInit, authenticatedUserTokenBeforeInit);
          } else if (queuedToken) {
            setUserToken(queuedToken, queuedUserToken, queuedAuthenticatedUserToken);
          }
          insightsClient("onUserTokenChange", setUserTokenToSearch, {
            immediate: true
          });
          insightsClient("onAuthenticatedUserTokenChange", function(authenticatedUserToken) {
            if (!authenticatedUserToken) {
              insightsClient("getUserToken", null, function(_2, userToken) {
                setUserTokenToSearch(userToken);
              });
            }
            setUserTokenToSearch(authenticatedUserToken);
          }, {
            immediate: true
          });
          var insightsClientWithLocalCredentials = insightsClient;
          if (isModernInsightsClient(insightsClient)) {
            insightsClientWithLocalCredentials = function insightsClientWithLocalCredentials2(method, payload) {
              var extraParams = {
                headers: {
                  "X-Algolia-Application-Id": appId,
                  "X-Algolia-API-Key": apiKey
                }
              };
              return insightsClient(method, payload, extraParams);
            };
          }
          instantSearchInstance.sendEventToInsights = function(event) {
            if (onEvent) {
              onEvent(event, insightsClientWithLocalCredentials);
            } else if (event.insightsMethod) {
              event.payload.algoliaSource = ["instantsearch"];
              if ($$automatic) {
                event.payload.algoliaSource.push("instantsearch-automatic");
              }
              if (event.eventModifier === "internal") {
                event.payload.algoliaSource.push("instantsearch-internal");
              }
              insightsClientWithLocalCredentials(event.insightsMethod, event.payload);
              true ? _warning(Boolean(helper.state.userToken), "\nCannot send event to Algolia Insights because `userToken` is not set.\n\nSee documentation: https://www.algolia.com/doc/guides/building-search-ui/going-further/send-insights-events/js/#setting-the-usertoken\n") : void 0;
            } else {
              true ? _warning(false, "Cannot send event to Algolia Insights because `insightsMethod` option is missing.") : void 0;
            }
          };
        },
        unsubscribe: function unsubscribe() {
          insightsClient("onUserTokenChange", void 0);
          insightsClient("onAuthenticatedUserTokenChange", void 0);
          instantSearchInstance.sendEventToInsights = noop;
          if (helper && initialParameters) {
            helper.overrideStateWithoutTriggeringChangeEvent(_objectSpread9(_objectSpread9({}, helper.state), initialParameters));
            instantSearchInstance.scheduleSearch();
          }
        }
      };
    };
  }
  function isModernInsightsClient(client) {
    var _split$map = (client.version || "").split(".").map(Number), _split$map2 = _slicedToArray4(_split$map, 2), major = _split$map2[0], minor = _split$map2[1];
    var v3 = major >= 3;
    var v2_6 = major === 2 && minor >= 6;
    var v1_10 = major === 1 && minor >= 10;
    return v3 || v2_6 || v1_10;
  }
  function normalizeUserToken(userToken) {
    if (!userToken) {
      return void 0;
    }
    return typeof userToken === "number" ? userToken.toString() : userToken;
  }

  // node_modules/instantsearch.js/es/middlewares/createMetadataMiddleware.js
  function extractWidgetPayload(widgets, instantSearchInstance, payload) {
    var initOptions = createInitArgs(instantSearchInstance, instantSearchInstance.mainIndex, instantSearchInstance._initialUiState);
    widgets.forEach(function(widget) {
      var widgetParams = {};
      if (widget.getWidgetRenderState) {
        var renderState = widget.getWidgetRenderState(initOptions);
        if (renderState && renderState.widgetParams) {
          widgetParams = renderState.widgetParams;
        }
      }
      var params = Object.keys(widgetParams).filter(function(key2) {
        return widgetParams[key2] !== void 0;
      });
      payload.widgets.push({
        type: widget.$$type,
        widgetType: widget.$$widgetType,
        params
      });
      if (widget.$$type === "ais.index") {
        extractWidgetPayload(widget.getWidgets(), instantSearchInstance, payload);
      }
    });
  }
  function isMetadataEnabled() {
    return safelyRunOnBrowser(function(_ref) {
      var _window$navigator, _window$navigator$use;
      var window2 = _ref.window;
      return ((_window$navigator = window2.navigator) === null || _window$navigator === void 0 ? void 0 : (_window$navigator$use = _window$navigator.userAgent) === null || _window$navigator$use === void 0 ? void 0 : _window$navigator$use.indexOf("Algolia Crawler")) > -1;
    }, {
      fallback: function fallback() {
        return false;
      }
    });
  }
  function createMetadataMiddleware() {
    var _ref2 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, _ref2$$$internal = _ref2.$$internal, $$internal = _ref2$$$internal === void 0 ? false : _ref2$$$internal;
    return function(_ref3) {
      var instantSearchInstance = _ref3.instantSearchInstance;
      var payload = {
        widgets: []
      };
      var payloadContainer = document.createElement("meta");
      var refNode = document.querySelector("head");
      payloadContainer.name = "instantsearch:widgets";
      return {
        $$type: "ais.metadata",
        $$internal,
        onStateChange: function onStateChange() {
        },
        subscribe: function subscribe() {
          setTimeout(function() {
            var client = instantSearchInstance.client;
            payload.ua = client.transporter && client.transporter.userAgent ? client.transporter.userAgent.value : client._ua;
            extractWidgetPayload(instantSearchInstance.mainIndex.getWidgets(), instantSearchInstance, payload);
            instantSearchInstance.middleware.forEach(function(middleware) {
              return payload.widgets.push({
                middleware: true,
                type: middleware.instance.$$type,
                internal: middleware.instance.$$internal
              });
            });
            payloadContainer.content = JSON.stringify(payload);
            refNode.appendChild(payloadContainer);
          }, 0);
        },
        started: function started() {
        },
        unsubscribe: function unsubscribe() {
          payloadContainer.remove();
        }
      };
    };
  }

  // node_modules/instantsearch.js/es/lib/routers/history.js
  var import_qs = __toESM(require_lib(), 1);
  function _typeof13(obj) {
    "@babel/helpers - typeof";
    return _typeof13 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof13(obj);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i2 = 0; i2 < props.length; i2++) {
      var descriptor = props[i2];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey10(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", { writable: false });
    return Constructor;
  }
  function _defineProperty10(obj, key2, value) {
    key2 = _toPropertyKey10(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey10(arg) {
    var key2 = _toPrimitive10(arg, "string");
    return _typeof13(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive10(input, hint) {
    if (_typeof13(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof13(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  var setWindowTitle = function setWindowTitle2(title) {
    if (title) {
      window.document.title = title;
    }
  };
  var BrowserHistory = /* @__PURE__ */ function() {
    function BrowserHistory2(_ref) {
      var _this = this;
      var windowTitle = _ref.windowTitle, _ref$writeDelay = _ref.writeDelay, writeDelay = _ref$writeDelay === void 0 ? 400 : _ref$writeDelay, createURL = _ref.createURL, parseURL = _ref.parseURL, getLocation = _ref.getLocation, start = _ref.start, dispose = _ref.dispose, push = _ref.push, cleanUrlOnDispose = _ref.cleanUrlOnDispose;
      _classCallCheck(this, BrowserHistory2);
      _defineProperty10(this, "$$type", "ais.browser");
      _defineProperty10(this, "windowTitle", void 0);
      _defineProperty10(this, "writeDelay", void 0);
      _defineProperty10(this, "_createURL", void 0);
      _defineProperty10(this, "parseURL", void 0);
      _defineProperty10(this, "getLocation", void 0);
      _defineProperty10(this, "writeTimer", void 0);
      _defineProperty10(this, "_onPopState", void 0);
      _defineProperty10(this, "inPopState", false);
      _defineProperty10(this, "isDisposed", false);
      _defineProperty10(this, "latestAcknowledgedHistory", 0);
      _defineProperty10(this, "_start", void 0);
      _defineProperty10(this, "_dispose", void 0);
      _defineProperty10(this, "_push", void 0);
      _defineProperty10(this, "_cleanUrlOnDispose", void 0);
      this.windowTitle = windowTitle;
      this.writeTimer = void 0;
      this.writeDelay = writeDelay;
      this._createURL = createURL;
      this.parseURL = parseURL;
      this.getLocation = getLocation;
      this._start = start;
      this._dispose = dispose;
      this._push = push;
      this._cleanUrlOnDispose = typeof cleanUrlOnDispose === "undefined" ? true : cleanUrlOnDispose;
      if (typeof cleanUrlOnDispose === "undefined") {
        console.info("Starting from the next major version, InstantSearch will not clean up the URL from active refinements when it is disposed.\n\nWe recommend setting `cleanUrlOnDispose` to false to adopt this change today.\nTo stay with the current behaviour and remove this warning, set the option to true.\n\nSee documentation: ".concat(createDocumentationLink({
          name: "history-router"
        }), "#widget-param-cleanurlondispose"));
      }
      safelyRunOnBrowser(function(_ref2) {
        var window2 = _ref2.window;
        var title = _this.windowTitle && _this.windowTitle(_this.read());
        setWindowTitle(title);
        _this.latestAcknowledgedHistory = window2.history.length;
      });
    }
    _createClass(BrowserHistory2, [{
      key: "read",
      value: function read() {
        return this.parseURL({
          qsModule: import_qs.default,
          location: this.getLocation()
        });
      }
      /**
       * Pushes a search state into the URL.
       */
    }, {
      key: "write",
      value: function write(routeState) {
        var _this2 = this;
        safelyRunOnBrowser(function(_ref3) {
          var window2 = _ref3.window;
          var url = _this2.createURL(routeState);
          var title = _this2.windowTitle && _this2.windowTitle(routeState);
          if (_this2.writeTimer) {
            clearTimeout(_this2.writeTimer);
          }
          _this2.writeTimer = setTimeout(function() {
            setWindowTitle(title);
            if (_this2.shouldWrite(url)) {
              if (_this2._push) {
                _this2._push(url);
              } else {
                window2.history.pushState(routeState, title || "", url);
              }
              _this2.latestAcknowledgedHistory = window2.history.length;
            }
            _this2.inPopState = false;
            _this2.writeTimer = void 0;
          }, _this2.writeDelay);
        });
      }
      /**
       * Sets a callback on the `onpopstate` event of the history API of the current page.
       * It enables the URL sync to keep track of the changes.
       */
    }, {
      key: "onUpdate",
      value: function onUpdate(callback) {
        var _this3 = this;
        if (this._start) {
          this._start(function() {
            callback(_this3.read());
          });
        }
        this._onPopState = function() {
          if (_this3.writeTimer) {
            clearTimeout(_this3.writeTimer);
            _this3.writeTimer = void 0;
          }
          _this3.inPopState = true;
          callback(_this3.read());
        };
        safelyRunOnBrowser(function(_ref4) {
          var window2 = _ref4.window;
          window2.addEventListener("popstate", _this3._onPopState);
        });
      }
      /**
       * Creates a complete URL from a given syncable UI state.
       *
       * It always generates the full URL, not a relative one.
       * This allows to handle cases like using a <base href>.
       * See: https://github.com/algolia/instantsearch/issues/790
       */
    }, {
      key: "createURL",
      value: function createURL(routeState) {
        var url = this._createURL({
          qsModule: import_qs.default,
          routeState,
          location: this.getLocation()
        });
        if (true) {
          try {
            new URL(url);
          } catch (e2) {
            true ? _warning(false, "The URL returned by the `createURL` function is invalid.\nPlease make sure it returns an absolute URL to avoid issues, e.g: `https://algolia.com/search?query=iphone`.") : void 0;
          }
        }
        return url;
      }
      /**
       * Removes the event listener and cleans up the URL.
       */
    }, {
      key: "dispose",
      value: function dispose() {
        var _this4 = this;
        if (this._dispose) {
          this._dispose();
        }
        this.isDisposed = true;
        safelyRunOnBrowser(function(_ref5) {
          var window2 = _ref5.window;
          if (_this4._onPopState) {
            window2.removeEventListener("popstate", _this4._onPopState);
          }
        });
        if (this.writeTimer) {
          clearTimeout(this.writeTimer);
        }
        if (this._cleanUrlOnDispose) {
          this.write({});
        }
      }
    }, {
      key: "start",
      value: function start() {
        this.isDisposed = false;
      }
    }, {
      key: "shouldWrite",
      value: function shouldWrite(url) {
        var _this5 = this;
        return safelyRunOnBrowser(function(_ref6) {
          var window2 = _ref6.window;
          var lastPushWasByISAfterDispose = !(_this5.isDisposed && _this5.latestAcknowledgedHistory !== window2.history.length);
          return (
            // When the last state change was through popstate, the IS.js state changes,
            // but that should not write the URL.
            !_this5.inPopState && // When the previous pushState after dispose was by IS.js, we want to write the URL.
            lastPushWasByISAfterDispose && // When the URL is the same as the current one, we do not want to write it.
            url !== window2.location.href
          );
        });
      }
    }]);
    return BrowserHistory2;
  }();
  function historyRouter() {
    var _ref7 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, _ref7$createURL = _ref7.createURL, createURL = _ref7$createURL === void 0 ? function(_ref8) {
      var qsModule = _ref8.qsModule, routeState = _ref8.routeState, location = _ref8.location;
      var protocol = location.protocol, hostname = location.hostname, _location$port = location.port, port = _location$port === void 0 ? "" : _location$port, pathname = location.pathname, hash = location.hash;
      var queryString = qsModule.stringify(routeState);
      var portWithPrefix = port === "" ? "" : ":".concat(port);
      if (!queryString) {
        return "".concat(protocol, "//").concat(hostname).concat(portWithPrefix).concat(pathname).concat(hash);
      }
      return "".concat(protocol, "//").concat(hostname).concat(portWithPrefix).concat(pathname, "?").concat(queryString).concat(hash);
    } : _ref7$createURL, _ref7$parseURL = _ref7.parseURL, parseURL = _ref7$parseURL === void 0 ? function(_ref9) {
      var qsModule = _ref9.qsModule, location = _ref9.location;
      return qsModule.parse(location.search.slice(1), {
        arrayLimit: 99
      });
    } : _ref7$parseURL, _ref7$writeDelay = _ref7.writeDelay, writeDelay = _ref7$writeDelay === void 0 ? 400 : _ref7$writeDelay, windowTitle = _ref7.windowTitle, _ref7$getLocation = _ref7.getLocation, getLocation = _ref7$getLocation === void 0 ? function() {
      return safelyRunOnBrowser(function(_ref10) {
        var window2 = _ref10.window;
        return window2.location;
      }, {
        fallback: function fallback() {
          throw new Error("You need to provide `getLocation` to the `history` router in environments where `window` does not exist.");
        }
      });
    } : _ref7$getLocation, start = _ref7.start, dispose = _ref7.dispose, push = _ref7.push, cleanUrlOnDispose = _ref7.cleanUrlOnDispose;
    return new BrowserHistory({
      createURL,
      parseURL,
      writeDelay,
      windowTitle,
      getLocation,
      start,
      dispose,
      push,
      cleanUrlOnDispose
    });
  }

  // node_modules/instantsearch.js/es/lib/stateMappings/simple.js
  function _typeof14(obj) {
    "@babel/helpers - typeof";
    return _typeof14 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof14(obj);
  }
  var _excluded3 = ["configure"];
  function ownKeys10(object, enumerableOnly) {
    var keys2 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys2.push.apply(keys2, symbols);
    }
    return keys2;
  }
  function _objectSpread10(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys10(Object(source), true).forEach(function(key2) {
        _defineProperty11(target, key2, source[key2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys10(Object(source)).forEach(function(key2) {
        Object.defineProperty(target, key2, Object.getOwnPropertyDescriptor(source, key2));
      });
    }
    return target;
  }
  function _defineProperty11(obj, key2, value) {
    key2 = _toPropertyKey11(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey11(arg) {
    var key2 = _toPrimitive11(arg, "string");
    return _typeof14(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive11(input, hint) {
    if (_typeof14(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof14(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _objectWithoutProperties3(source, excluded) {
    if (source == null) return {};
    var target = _objectWithoutPropertiesLoose3(source, excluded);
    var key2, i2;
    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i2 = 0; i2 < sourceSymbolKeys.length; i2++) {
        key2 = sourceSymbolKeys[i2];
        if (excluded.indexOf(key2) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key2)) continue;
        target[key2] = source[key2];
      }
    }
    return target;
  }
  function _objectWithoutPropertiesLoose3(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key2, i2;
    for (i2 = 0; i2 < sourceKeys.length; i2++) {
      key2 = sourceKeys[i2];
      if (excluded.indexOf(key2) >= 0) continue;
      target[key2] = source[key2];
    }
    return target;
  }
  function getIndexStateWithoutConfigure(uiState) {
    var configure = uiState.configure, trackedUiState = _objectWithoutProperties3(uiState, _excluded3);
    return trackedUiState;
  }
  function simpleStateMapping() {
    return {
      $$type: "ais.simple",
      stateToRoute: function stateToRoute(uiState) {
        return Object.keys(uiState).reduce(function(state, indexId) {
          return _objectSpread10(_objectSpread10({}, state), {}, _defineProperty11({}, indexId, getIndexStateWithoutConfigure(uiState[indexId])));
        }, {});
      },
      routeToState: function routeToState() {
        var routeState = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        return Object.keys(routeState).reduce(function(state, indexId) {
          return _objectSpread10(_objectSpread10({}, state), {}, _defineProperty11({}, indexId, getIndexStateWithoutConfigure(routeState[indexId])));
        }, {});
      }
    };
  }

  // node_modules/instantsearch.js/es/middlewares/createRouterMiddleware.js
  function _typeof15(obj) {
    "@babel/helpers - typeof";
    return _typeof15 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof15(obj);
  }
  function ownKeys11(object, enumerableOnly) {
    var keys2 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys2.push.apply(keys2, symbols);
    }
    return keys2;
  }
  function _objectSpread11(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys11(Object(source), true).forEach(function(key2) {
        _defineProperty12(target, key2, source[key2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys11(Object(source)).forEach(function(key2) {
        Object.defineProperty(target, key2, Object.getOwnPropertyDescriptor(source, key2));
      });
    }
    return target;
  }
  function _defineProperty12(obj, key2, value) {
    key2 = _toPropertyKey12(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey12(arg) {
    var key2 = _toPrimitive12(arg, "string");
    return _typeof15(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive12(input, hint) {
    if (_typeof15(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof15(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  var createRouterMiddleware = function createRouterMiddleware2() {
    var props = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    var _props$router = props.router, router = _props$router === void 0 ? historyRouter() : _props$router, _props$stateMapping = props.stateMapping, stateMapping = _props$stateMapping === void 0 ? simpleStateMapping() : _props$stateMapping, _props$$$internal = props.$$internal, $$internal = _props$$$internal === void 0 ? false : _props$$$internal;
    return function(_ref) {
      var instantSearchInstance = _ref.instantSearchInstance;
      function topLevelCreateURL(nextState) {
        var previousUiState = (
          // If only the mainIndex is initialized, we don't yet know what other
          // index widgets are used. Therefore we fall back to the initialUiState.
          // We can't indiscriminately use the initialUiState because then we
          // reintroduce state that was changed by the user.
          // When there are no widgets, we are sure the user can't yet have made
          // any changes.
          instantSearchInstance.mainIndex.getWidgets().length === 0 ? instantSearchInstance._initialUiState : instantSearchInstance.mainIndex.getWidgetUiState({})
        );
        var uiState = Object.keys(nextState).reduce(function(acc, indexId) {
          return _objectSpread11(_objectSpread11({}, acc), {}, _defineProperty12({}, indexId, nextState[indexId]));
        }, previousUiState);
        var route = stateMapping.stateToRoute(uiState);
        return router.createURL(route);
      }
      instantSearchInstance._createURL = topLevelCreateURL;
      var lastRouteState = void 0;
      var initialUiState = instantSearchInstance._initialUiState;
      return {
        $$type: "ais.router({router:".concat(router.$$type || "__unknown__", ", stateMapping:").concat(stateMapping.$$type || "__unknown__", "})"),
        $$internal,
        onStateChange: function onStateChange(_ref2) {
          var uiState = _ref2.uiState;
          var routeState = stateMapping.stateToRoute(uiState);
          if (lastRouteState === void 0 || !isEqual(lastRouteState, routeState)) {
            router.write(routeState);
            lastRouteState = routeState;
          }
        },
        subscribe: function subscribe() {
          instantSearchInstance._initialUiState = _objectSpread11(_objectSpread11({}, initialUiState), stateMapping.routeToState(router.read()));
          router.onUpdate(function(route) {
            if (instantSearchInstance.mainIndex.getWidgets().length > 0) {
              instantSearchInstance.setUiState(stateMapping.routeToState(route));
            }
          });
        },
        started: function started() {
          var _router$start;
          (_router$start = router.start) === null || _router$start === void 0 ? void 0 : _router$start.call(router);
        },
        unsubscribe: function unsubscribe() {
          router.dispose();
        }
      };
    };
  };

  // ../../node_modules/@babel/runtime/helpers/esm/extends.js
  function _extends2() {
    _extends2 = Object.assign ? Object.assign.bind() : function(target) {
      for (var i2 = 1; i2 < arguments.length; i2++) {
        var source = arguments[i2];
        for (var key2 in source) {
          if (Object.prototype.hasOwnProperty.call(source, key2)) {
            target[key2] = source[key2];
          }
        }
      }
      return target;
    };
    return _extends2.apply(this, arguments);
  }

  // ../../node_modules/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js
  function _objectWithoutPropertiesLoose4(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key2, i2;
    for (i2 = 0; i2 < sourceKeys.length; i2++) {
      key2 = sourceKeys[i2];
      if (excluded.indexOf(key2) >= 0) continue;
      target[key2] = source[key2];
    }
    return target;
  }

  // ../../node_modules/@babel/runtime/helpers/esm/objectWithoutProperties.js
  function _objectWithoutProperties4(source, excluded) {
    if (source == null) return {};
    var target = _objectWithoutPropertiesLoose4(source, excluded);
    var key2, i2;
    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i2 = 0; i2 < sourceSymbolKeys.length; i2++) {
        key2 = sourceSymbolKeys[i2];
        if (excluded.indexOf(key2) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key2)) continue;
        target[key2] = source[key2];
      }
    }
    return target;
  }

  // node_modules/instantsearch-ui-components/dist/es/lib/cx.js
  function cx() {
    for (var _len = arguments.length, classNames = new Array(_len), _key = 0; _key < _len; _key++) {
      classNames[_key] = arguments[_key];
    }
    return classNames.reduce(function(acc, className) {
      if (Array.isArray(className)) {
        return acc.concat(className);
      }
      return acc.concat([className]);
    }, []).filter(Boolean).join(" ");
  }

  // node_modules/instantsearch-ui-components/dist/es/components/Highlight.js
  var _excluded4 = ["parts", "highlightedTagName", "nonHighlightedTagName", "separator", "className", "classNames"];
  function createHighlightPartComponent(_ref) {
    var createElement = _ref.createElement;
    return function HighlightPart(_ref2) {
      var classNames = _ref2.classNames, children = _ref2.children, highlightedTagName = _ref2.highlightedTagName, isHighlighted = _ref2.isHighlighted, nonHighlightedTagName = _ref2.nonHighlightedTagName;
      var TagName = isHighlighted ? highlightedTagName : nonHighlightedTagName;
      return createElement(TagName, {
        className: isHighlighted ? classNames.highlighted : classNames.nonHighlighted
      }, children);
    };
  }
  function createHighlightComponent(_ref3) {
    var createElement = _ref3.createElement, Fragment = _ref3.Fragment;
    var HighlightPart = createHighlightPartComponent({
      createElement,
      Fragment
    });
    return function Highlight3(userProps) {
      var parts = userProps.parts, _userProps$highlighte = userProps.highlightedTagName, highlightedTagName = _userProps$highlighte === void 0 ? "mark" : _userProps$highlighte, _userProps$nonHighlig = userProps.nonHighlightedTagName, nonHighlightedTagName = _userProps$nonHighlig === void 0 ? "span" : _userProps$nonHighlig, _userProps$separator = userProps.separator, separator = _userProps$separator === void 0 ? ", " : _userProps$separator, className = userProps.className, _userProps$classNames = userProps.classNames, classNames = _userProps$classNames === void 0 ? {} : _userProps$classNames, props = _objectWithoutProperties4(userProps, _excluded4);
      return createElement("span", _extends2({}, props, {
        className: cx(classNames.root, className)
      }), parts.map(function(part, partIndex) {
        var isLastPart = partIndex === parts.length - 1;
        return createElement(Fragment, {
          key: partIndex
        }, part.map(function(subPart, subPartIndex) {
          return createElement(HighlightPart, {
            key: subPartIndex,
            classNames,
            highlightedTagName,
            nonHighlightedTagName,
            isHighlighted: subPart.isHighlighted
          }, subPart.value);
        }), !isLastPart && createElement("span", {
          className: classNames.separator
        }, separator));
      }));
    };
  }

  // node_modules/instantsearch-ui-components/dist/es/components/Hits.js
  var _excluded5 = ["classNames", "hits", "itemComponent", "sendEvent", "emptyComponent", "banner", "bannerComponent"];
  function createDefaultBannerComponent(_ref) {
    var createElement = _ref.createElement;
    return function DefaultBanner(_ref2) {
      var classNames = _ref2.classNames, banner = _ref2.banner;
      if (!banner.image.urls[0].url) {
        return null;
      }
      return createElement("aside", {
        className: cx("ais-Hits-banner", classNames.bannerRoot)
      }, banner.link ? createElement("a", {
        className: cx("ais-Hits-banner-link", classNames.bannerLink),
        href: banner.link.url,
        target: banner.link.target
      }, createElement("img", {
        className: cx("ais-Hits-banner-image", classNames.bannerImage),
        src: banner.image.urls[0].url,
        alt: banner.image.title
      })) : createElement("img", {
        className: cx("ais-Hits-banner-image", classNames.bannerImage),
        src: banner.image.urls[0].url,
        alt: banner.image.title
      }));
    };
  }
  function createHitsComponent(_ref3) {
    var createElement = _ref3.createElement, Fragment = _ref3.Fragment;
    var DefaultBannerComponent = createDefaultBannerComponent({
      createElement,
      Fragment
    });
    return function Hits2(userProps) {
      var _userProps$classNames = userProps.classNames, classNames = _userProps$classNames === void 0 ? {} : _userProps$classNames, hits2 = userProps.hits, ItemComponent = userProps.itemComponent, sendEvent = userProps.sendEvent, EmptyComponent = userProps.emptyComponent, banner = userProps.banner, BannerComponent = userProps.bannerComponent, props = _objectWithoutProperties4(userProps, _excluded5);
      return createElement("div", _extends2({}, props, {
        className: cx("ais-Hits", classNames.root, hits2.length === 0 && cx("ais-Hits--empty", classNames.emptyRoot), props.className)
      }), banner && (BannerComponent ? createElement(BannerComponent, {
        className: cx("ais-Hits-banner", classNames.bannerRoot),
        banner
      }) : createElement(DefaultBannerComponent, {
        classNames,
        banner
      })), hits2.length === 0 && EmptyComponent ? createElement(EmptyComponent, null) : createElement("ol", {
        className: cx("ais-Hits-list", classNames.list)
      }, hits2.map(function(hit, index3) {
        return createElement(ItemComponent, {
          key: hit.objectID,
          hit,
          index: index3,
          className: cx("ais-Hits-item", classNames.item),
          onClick: function onClick() {
            sendEvent("click:internal", hit, "Hit Clicked");
          },
          onAuxClick: function onAuxClick() {
            sendEvent("click:internal", hit, "Hit Clicked");
          }
        });
      })));
    };
  }

  // ../../node_modules/preact/dist/preact.module.js
  var n;
  var l;
  var u;
  var i;
  var t;
  var o;
  var r;
  var f = {};
  var e = [];
  var c = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
  function s(n3, l2) {
    for (var u2 in l2) n3[u2] = l2[u2];
    return n3;
  }
  function a(n3) {
    var l2 = n3.parentNode;
    l2 && l2.removeChild(n3);
  }
  function h(l2, u2, i2) {
    var t3, o2, r2, f2 = {};
    for (r2 in u2) "key" == r2 ? t3 = u2[r2] : "ref" == r2 ? o2 = u2[r2] : f2[r2] = u2[r2];
    if (arguments.length > 2 && (f2.children = arguments.length > 3 ? n.call(arguments, 2) : i2), "function" == typeof l2 && null != l2.defaultProps) for (r2 in l2.defaultProps) void 0 === f2[r2] && (f2[r2] = l2.defaultProps[r2]);
    return v(l2, f2, t3, o2, null);
  }
  function v(n3, i2, t3, o2, r2) {
    var f2 = { type: n3, props: i2, key: t3, ref: o2, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, __h: null, constructor: void 0, __v: null == r2 ? ++u : r2 };
    return null == r2 && null != l.vnode && l.vnode(f2), f2;
  }
  function y() {
    return { current: null };
  }
  function p(n3) {
    return n3.children;
  }
  function d(n3, l2) {
    this.props = n3, this.context = l2;
  }
  function _(n3, l2) {
    if (null == l2) return n3.__ ? _(n3.__, n3.__.__k.indexOf(n3) + 1) : null;
    for (var u2; l2 < n3.__k.length; l2++) if (null != (u2 = n3.__k[l2]) && null != u2.__e) return u2.__e;
    return "function" == typeof n3.type ? _(n3) : null;
  }
  function k(n3) {
    var l2, u2;
    if (null != (n3 = n3.__) && null != n3.__c) {
      for (n3.__e = n3.__c.base = null, l2 = 0; l2 < n3.__k.length; l2++) if (null != (u2 = n3.__k[l2]) && null != u2.__e) {
        n3.__e = n3.__c.base = u2.__e;
        break;
      }
      return k(n3);
    }
  }
  function b(n3) {
    (!n3.__d && (n3.__d = true) && t.push(n3) && !g.__r++ || o !== l.debounceRendering) && ((o = l.debounceRendering) || setTimeout)(g);
  }
  function g() {
    for (var n3; g.__r = t.length; ) n3 = t.sort(function(n4, l2) {
      return n4.__v.__b - l2.__v.__b;
    }), t = [], n3.some(function(n4) {
      var l2, u2, i2, t3, o2, r2;
      n4.__d && (o2 = (t3 = (l2 = n4).__v).__e, (r2 = l2.__P) && (u2 = [], (i2 = s({}, t3)).__v = t3.__v + 1, j(r2, t3, i2, l2.__n, void 0 !== r2.ownerSVGElement, null != t3.__h ? [o2] : null, u2, null == o2 ? _(t3) : o2, t3.__h), z(u2, t3), t3.__e != o2 && k(t3)));
    });
  }
  function w(n3, l2, u2, i2, t3, o2, r2, c2, s2, a2) {
    var h2, y2, d2, k2, b2, g2, w2, x = i2 && i2.__k || e, C2 = x.length;
    for (u2.__k = [], h2 = 0; h2 < l2.length; h2++) if (null != (k2 = u2.__k[h2] = null == (k2 = l2[h2]) || "boolean" == typeof k2 ? null : "string" == typeof k2 || "number" == typeof k2 || "bigint" == typeof k2 ? v(null, k2, null, null, k2) : Array.isArray(k2) ? v(p, { children: k2 }, null, null, null) : k2.__b > 0 ? v(k2.type, k2.props, k2.key, k2.ref ? k2.ref : null, k2.__v) : k2)) {
      if (k2.__ = u2, k2.__b = u2.__b + 1, null === (d2 = x[h2]) || d2 && k2.key == d2.key && k2.type === d2.type) x[h2] = void 0;
      else for (y2 = 0; y2 < C2; y2++) {
        if ((d2 = x[y2]) && k2.key == d2.key && k2.type === d2.type) {
          x[y2] = void 0;
          break;
        }
        d2 = null;
      }
      j(n3, k2, d2 = d2 || f, t3, o2, r2, c2, s2, a2), b2 = k2.__e, (y2 = k2.ref) && d2.ref != y2 && (w2 || (w2 = []), d2.ref && w2.push(d2.ref, null, k2), w2.push(y2, k2.__c || b2, k2)), null != b2 ? (null == g2 && (g2 = b2), "function" == typeof k2.type && k2.__k === d2.__k ? k2.__d = s2 = m(k2, s2, n3) : s2 = A(n3, k2, d2, x, b2, s2), "function" == typeof u2.type && (u2.__d = s2)) : s2 && d2.__e == s2 && s2.parentNode != n3 && (s2 = _(d2));
    }
    for (u2.__e = g2, h2 = C2; h2--; ) null != x[h2] && ("function" == typeof u2.type && null != x[h2].__e && x[h2].__e == u2.__d && (u2.__d = _(i2, h2 + 1)), N(x[h2], x[h2]));
    if (w2) for (h2 = 0; h2 < w2.length; h2++) M(w2[h2], w2[++h2], w2[++h2]);
  }
  function m(n3, l2, u2) {
    for (var i2, t3 = n3.__k, o2 = 0; t3 && o2 < t3.length; o2++) (i2 = t3[o2]) && (i2.__ = n3, l2 = "function" == typeof i2.type ? m(i2, l2, u2) : A(u2, i2, i2, t3, i2.__e, l2));
    return l2;
  }
  function A(n3, l2, u2, i2, t3, o2) {
    var r2, f2, e2;
    if (void 0 !== l2.__d) r2 = l2.__d, l2.__d = void 0;
    else if (null == u2 || t3 != o2 || null == t3.parentNode) n: if (null == o2 || o2.parentNode !== n3) n3.appendChild(t3), r2 = null;
    else {
      for (f2 = o2, e2 = 0; (f2 = f2.nextSibling) && e2 < i2.length; e2 += 2) if (f2 == t3) break n;
      n3.insertBefore(t3, o2), r2 = o2;
    }
    return void 0 !== r2 ? r2 : t3.nextSibling;
  }
  function C(n3, l2, u2, i2, t3) {
    var o2;
    for (o2 in u2) "children" === o2 || "key" === o2 || o2 in l2 || H(n3, o2, null, u2[o2], i2);
    for (o2 in l2) t3 && "function" != typeof l2[o2] || "children" === o2 || "key" === o2 || "value" === o2 || "checked" === o2 || u2[o2] === l2[o2] || H(n3, o2, l2[o2], u2[o2], i2);
  }
  function $(n3, l2, u2) {
    "-" === l2[0] ? n3.setProperty(l2, u2) : n3[l2] = null == u2 ? "" : "number" != typeof u2 || c.test(l2) ? u2 : u2 + "px";
  }
  function H(n3, l2, u2, i2, t3) {
    var o2;
    n: if ("style" === l2) if ("string" == typeof u2) n3.style.cssText = u2;
    else {
      if ("string" == typeof i2 && (n3.style.cssText = i2 = ""), i2) for (l2 in i2) u2 && l2 in u2 || $(n3.style, l2, "");
      if (u2) for (l2 in u2) i2 && u2[l2] === i2[l2] || $(n3.style, l2, u2[l2]);
    }
    else if ("o" === l2[0] && "n" === l2[1]) o2 = l2 !== (l2 = l2.replace(/Capture$/, "")), l2 = l2.toLowerCase() in n3 ? l2.toLowerCase().slice(2) : l2.slice(2), n3.l || (n3.l = {}), n3.l[l2 + o2] = u2, u2 ? i2 || n3.addEventListener(l2, o2 ? T : I, o2) : n3.removeEventListener(l2, o2 ? T : I, o2);
    else if ("dangerouslySetInnerHTML" !== l2) {
      if (t3) l2 = l2.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
      else if ("href" !== l2 && "list" !== l2 && "form" !== l2 && "tabIndex" !== l2 && "download" !== l2 && l2 in n3) try {
        n3[l2] = null == u2 ? "" : u2;
        break n;
      } catch (n4) {
      }
      "function" == typeof u2 || (null != u2 && (false !== u2 || "a" === l2[0] && "r" === l2[1]) ? n3.setAttribute(l2, u2) : n3.removeAttribute(l2));
    }
  }
  function I(n3) {
    this.l[n3.type + false](l.event ? l.event(n3) : n3);
  }
  function T(n3) {
    this.l[n3.type + true](l.event ? l.event(n3) : n3);
  }
  function j(n3, u2, i2, t3, o2, r2, f2, e2, c2) {
    var a2, h2, v2, y2, _2, k2, b2, g2, m3, x, A2, C2, $2, H2 = u2.type;
    if (void 0 !== u2.constructor) return null;
    null != i2.__h && (c2 = i2.__h, e2 = u2.__e = i2.__e, u2.__h = null, r2 = [e2]), (a2 = l.__b) && a2(u2);
    try {
      n: if ("function" == typeof H2) {
        if (g2 = u2.props, m3 = (a2 = H2.contextType) && t3[a2.__c], x = a2 ? m3 ? m3.props.value : a2.__ : t3, i2.__c ? b2 = (h2 = u2.__c = i2.__c).__ = h2.__E : ("prototype" in H2 && H2.prototype.render ? u2.__c = h2 = new H2(g2, x) : (u2.__c = h2 = new d(g2, x), h2.constructor = H2, h2.render = O), m3 && m3.sub(h2), h2.props = g2, h2.state || (h2.state = {}), h2.context = x, h2.__n = t3, v2 = h2.__d = true, h2.__h = []), null == h2.__s && (h2.__s = h2.state), null != H2.getDerivedStateFromProps && (h2.__s == h2.state && (h2.__s = s({}, h2.__s)), s(h2.__s, H2.getDerivedStateFromProps(g2, h2.__s))), y2 = h2.props, _2 = h2.state, v2) null == H2.getDerivedStateFromProps && null != h2.componentWillMount && h2.componentWillMount(), null != h2.componentDidMount && h2.__h.push(h2.componentDidMount);
        else {
          if (null == H2.getDerivedStateFromProps && g2 !== y2 && null != h2.componentWillReceiveProps && h2.componentWillReceiveProps(g2, x), !h2.__e && null != h2.shouldComponentUpdate && false === h2.shouldComponentUpdate(g2, h2.__s, x) || u2.__v === i2.__v) {
            h2.props = g2, h2.state = h2.__s, u2.__v !== i2.__v && (h2.__d = false), h2.__v = u2, u2.__e = i2.__e, u2.__k = i2.__k, u2.__k.forEach(function(n4) {
              n4 && (n4.__ = u2);
            }), h2.__h.length && f2.push(h2);
            break n;
          }
          null != h2.componentWillUpdate && h2.componentWillUpdate(g2, h2.__s, x), null != h2.componentDidUpdate && h2.__h.push(function() {
            h2.componentDidUpdate(y2, _2, k2);
          });
        }
        if (h2.context = x, h2.props = g2, h2.__v = u2, h2.__P = n3, A2 = l.__r, C2 = 0, "prototype" in H2 && H2.prototype.render) h2.state = h2.__s, h2.__d = false, A2 && A2(u2), a2 = h2.render(h2.props, h2.state, h2.context);
        else do {
          h2.__d = false, A2 && A2(u2), a2 = h2.render(h2.props, h2.state, h2.context), h2.state = h2.__s;
        } while (h2.__d && ++C2 < 25);
        h2.state = h2.__s, null != h2.getChildContext && (t3 = s(s({}, t3), h2.getChildContext())), v2 || null == h2.getSnapshotBeforeUpdate || (k2 = h2.getSnapshotBeforeUpdate(y2, _2)), $2 = null != a2 && a2.type === p && null == a2.key ? a2.props.children : a2, w(n3, Array.isArray($2) ? $2 : [$2], u2, i2, t3, o2, r2, f2, e2, c2), h2.base = u2.__e, u2.__h = null, h2.__h.length && f2.push(h2), b2 && (h2.__E = h2.__ = null), h2.__e = false;
      } else null == r2 && u2.__v === i2.__v ? (u2.__k = i2.__k, u2.__e = i2.__e) : u2.__e = L(i2.__e, u2, i2, t3, o2, r2, f2, c2);
      (a2 = l.diffed) && a2(u2);
    } catch (n4) {
      u2.__v = null, (c2 || null != r2) && (u2.__e = e2, u2.__h = !!c2, r2[r2.indexOf(e2)] = null), l.__e(n4, u2, i2);
    }
  }
  function z(n3, u2) {
    l.__c && l.__c(u2, n3), n3.some(function(u3) {
      try {
        n3 = u3.__h, u3.__h = [], n3.some(function(n4) {
          n4.call(u3);
        });
      } catch (n4) {
        l.__e(n4, u3.__v);
      }
    });
  }
  function L(l2, u2, i2, t3, o2, r2, e2, c2) {
    var s2, h2, v2, y2 = i2.props, p2 = u2.props, d2 = u2.type, k2 = 0;
    if ("svg" === d2 && (o2 = true), null != r2) {
      for (; k2 < r2.length; k2++) if ((s2 = r2[k2]) && "setAttribute" in s2 == !!d2 && (d2 ? s2.localName === d2 : 3 === s2.nodeType)) {
        l2 = s2, r2[k2] = null;
        break;
      }
    }
    if (null == l2) {
      if (null === d2) return document.createTextNode(p2);
      l2 = o2 ? document.createElementNS("http://www.w3.org/2000/svg", d2) : document.createElement(d2, p2.is && p2), r2 = null, c2 = false;
    }
    if (null === d2) y2 === p2 || c2 && l2.data === p2 || (l2.data = p2);
    else {
      if (r2 = r2 && n.call(l2.childNodes), h2 = (y2 = i2.props || f).dangerouslySetInnerHTML, v2 = p2.dangerouslySetInnerHTML, !c2) {
        if (null != r2) for (y2 = {}, k2 = 0; k2 < l2.attributes.length; k2++) y2[l2.attributes[k2].name] = l2.attributes[k2].value;
        (v2 || h2) && (v2 && (h2 && v2.__html == h2.__html || v2.__html === l2.innerHTML) || (l2.innerHTML = v2 && v2.__html || ""));
      }
      if (C(l2, p2, y2, o2, c2), v2) u2.__k = [];
      else if (k2 = u2.props.children, w(l2, Array.isArray(k2) ? k2 : [k2], u2, i2, t3, o2 && "foreignObject" !== d2, r2, e2, r2 ? r2[0] : i2.__k && _(i2, 0), c2), null != r2) for (k2 = r2.length; k2--; ) null != r2[k2] && a(r2[k2]);
      c2 || ("value" in p2 && void 0 !== (k2 = p2.value) && (k2 !== l2.value || "progress" === d2 && !k2 || "option" === d2 && k2 !== y2.value) && H(l2, "value", k2, y2.value, false), "checked" in p2 && void 0 !== (k2 = p2.checked) && k2 !== l2.checked && H(l2, "checked", k2, y2.checked, false));
    }
    return l2;
  }
  function M(n3, u2, i2) {
    try {
      "function" == typeof n3 ? n3(u2) : n3.current = u2;
    } catch (n4) {
      l.__e(n4, i2);
    }
  }
  function N(n3, u2, i2) {
    var t3, o2;
    if (l.unmount && l.unmount(n3), (t3 = n3.ref) && (t3.current && t3.current !== n3.__e || M(t3, null, u2)), null != (t3 = n3.__c)) {
      if (t3.componentWillUnmount) try {
        t3.componentWillUnmount();
      } catch (n4) {
        l.__e(n4, u2);
      }
      t3.base = t3.__P = null, n3.__c = void 0;
    }
    if (t3 = n3.__k) for (o2 = 0; o2 < t3.length; o2++) t3[o2] && N(t3[o2], u2, "function" != typeof n3.type);
    i2 || null == n3.__e || a(n3.__e), n3.__ = n3.__e = n3.__d = void 0;
  }
  function O(n3, l2, u2) {
    return this.constructor(n3, u2);
  }
  function P(u2, i2, t3) {
    var o2, r2, e2;
    l.__ && l.__(u2, i2), r2 = (o2 = "function" == typeof t3) ? null : t3 && t3.__k || i2.__k, e2 = [], j(i2, u2 = (!o2 && t3 || i2).__k = h(p, null, [u2]), r2 || f, f, void 0 !== i2.ownerSVGElement, !o2 && t3 ? [t3] : r2 ? null : i2.firstChild ? n.call(i2.childNodes) : null, e2, !o2 && t3 ? t3 : r2 ? r2.__e : i2.firstChild, o2), z(e2, u2);
  }
  n = e.slice, l = { __e: function(n3, l2, u2, i2) {
    for (var t3, o2, r2; l2 = l2.__; ) if ((t3 = l2.__c) && !t3.__) try {
      if ((o2 = t3.constructor) && null != o2.getDerivedStateFromError && (t3.setState(o2.getDerivedStateFromError(n3)), r2 = t3.__d), null != t3.componentDidCatch && (t3.componentDidCatch(n3, i2 || {}), r2 = t3.__d), r2) return t3.__E = t3;
    } catch (l3) {
      n3 = l3;
    }
    throw n3;
  } }, u = 0, i = function(n3) {
    return null != n3 && void 0 === n3.constructor;
  }, d.prototype.setState = function(n3, l2) {
    var u2;
    u2 = null != this.__s && this.__s !== this.state ? this.__s : this.__s = s({}, this.state), "function" == typeof n3 && (n3 = n3(s({}, u2), this.props)), n3 && s(u2, n3), null != n3 && this.__v && (l2 && this.__h.push(l2), b(this));
  }, d.prototype.forceUpdate = function(n3) {
    this.__v && (this.__e = true, n3 && this.__h.push(n3), b(this));
  }, d.prototype.render = p, t = [], g.__r = 0, r = 0;

  // node_modules/instantsearch.js/es/lib/templating/prepareTemplateProps.js
  function _typeof16(obj) {
    "@babel/helpers - typeof";
    return _typeof16 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof16(obj);
  }
  function ownKeys12(object, enumerableOnly) {
    var keys2 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys2.push.apply(keys2, symbols);
    }
    return keys2;
  }
  function _objectSpread12(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys12(Object(source), true).forEach(function(key2) {
        _defineProperty13(target, key2, source[key2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys12(Object(source)).forEach(function(key2) {
        Object.defineProperty(target, key2, Object.getOwnPropertyDescriptor(source, key2));
      });
    }
    return target;
  }
  function _defineProperty13(obj, key2, value) {
    key2 = _toPropertyKey13(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey13(arg) {
    var key2 = _toPrimitive13(arg, "string");
    return _typeof16(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive13(input, hint) {
    if (_typeof16(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof16(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toConsumableArray3(arr) {
    return _arrayWithoutHoles3(arr) || _iterableToArray3(arr) || _unsupportedIterableToArray5(arr) || _nonIterableSpread3();
  }
  function _nonIterableSpread3() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray5(o2, minLen) {
    if (!o2) return;
    if (typeof o2 === "string") return _arrayLikeToArray5(o2, minLen);
    var n3 = Object.prototype.toString.call(o2).slice(8, -1);
    if (n3 === "Object" && o2.constructor) n3 = o2.constructor.name;
    if (n3 === "Map" || n3 === "Set") return Array.from(o2);
    if (n3 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n3)) return _arrayLikeToArray5(o2, minLen);
  }
  function _iterableToArray3(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
  function _arrayWithoutHoles3(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray5(arr);
  }
  function _arrayLikeToArray5(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i2 = 0, arr2 = new Array(len); i2 < len; i2++) arr2[i2] = arr[i2];
    return arr2;
  }
  function prepareTemplates(defaultTemplates3) {
    var templates = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var allKeys = uniq([].concat(_toConsumableArray3(Object.keys(defaultTemplates3 || {})), _toConsumableArray3(Object.keys(templates))));
    return allKeys.reduce(function(config, key2) {
      var defaultTemplate = defaultTemplates3 ? defaultTemplates3[key2] : void 0;
      var customTemplate = templates[key2];
      var isCustomTemplate = customTemplate !== void 0 && customTemplate !== defaultTemplate;
      config.templates[key2] = isCustomTemplate ? customTemplate : defaultTemplate;
      config.useCustomCompileOptions[key2] = isCustomTemplate;
      return config;
    }, {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      templates: {},
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      useCustomCompileOptions: {}
    });
  }
  function prepareTemplateProps(_ref) {
    var defaultTemplates3 = _ref.defaultTemplates, templates = _ref.templates, templatesConfig = _ref.templatesConfig;
    var preparedTemplates = prepareTemplates(defaultTemplates3, templates);
    return _objectSpread12({
      templatesConfig
    }, preparedTemplates);
  }

  // node_modules/instantsearch.js/es/lib/templating/renderTemplate.js
  var import_hogan = __toESM(require_hogan(), 1);

  // ../../node_modules/htm/dist/htm.module.js
  var n2 = function(t3, s2, r2, e2) {
    var u2;
    s2[0] = 0;
    for (var h2 = 1; h2 < s2.length; h2++) {
      var p2 = s2[h2++], a2 = s2[h2] ? (s2[0] |= p2 ? 1 : 2, r2[s2[h2++]]) : s2[++h2];
      3 === p2 ? e2[0] = a2 : 4 === p2 ? e2[1] = Object.assign(e2[1] || {}, a2) : 5 === p2 ? (e2[1] = e2[1] || {})[s2[++h2]] = a2 : 6 === p2 ? e2[1][s2[++h2]] += a2 + "" : p2 ? (u2 = t3.apply(a2, n2(t3, a2, r2, ["", null])), e2.push(u2), a2[0] ? s2[0] |= 2 : (s2[h2 - 2] = 0, s2[h2] = u2)) : e2.push(a2);
    }
    return e2;
  };
  var t2 = /* @__PURE__ */ new Map();
  function htm_module_default(s2) {
    var r2 = t2.get(this);
    return r2 || (r2 = /* @__PURE__ */ new Map(), t2.set(this, r2)), (r2 = n2(this, r2.get(s2) || (r2.set(s2, r2 = function(n3) {
      for (var t3, s3, r3 = 1, e2 = "", u2 = "", h2 = [0], p2 = function(n4) {
        1 === r3 && (n4 || (e2 = e2.replace(/^\s*\n\s*|\s*\n\s*$/g, ""))) ? h2.push(0, n4, e2) : 3 === r3 && (n4 || e2) ? (h2.push(3, n4, e2), r3 = 2) : 2 === r3 && "..." === e2 && n4 ? h2.push(4, n4, 0) : 2 === r3 && e2 && !n4 ? h2.push(5, 0, true, e2) : r3 >= 5 && ((e2 || !n4 && 5 === r3) && (h2.push(r3, 0, e2, s3), r3 = 6), n4 && (h2.push(r3, n4, 0, s3), r3 = 6)), e2 = "";
      }, a2 = 0; a2 < n3.length; a2++) {
        a2 && (1 === r3 && p2(), p2(a2));
        for (var l2 = 0; l2 < n3[a2].length; l2++) t3 = n3[a2][l2], 1 === r3 ? "<" === t3 ? (p2(), h2 = [h2], r3 = 3) : e2 += t3 : 4 === r3 ? "--" === e2 && ">" === t3 ? (r3 = 1, e2 = "") : e2 = t3 + e2[0] : u2 ? t3 === u2 ? u2 = "" : e2 += t3 : '"' === t3 || "'" === t3 ? u2 = t3 : ">" === t3 ? (p2(), r3 = 1) : r3 && ("=" === t3 ? (r3 = 5, s3 = e2, e2 = "") : "/" === t3 && (r3 < 5 || ">" === n3[a2][l2 + 1]) ? (p2(), 3 === r3 && (h2 = h2[0]), r3 = h2, (h2 = h2[0]).push(2, 0, r3), r3 = 0) : " " === t3 || "	" === t3 || "\n" === t3 || "\r" === t3 ? (p2(), r3 = 2) : e2 += t3), 3 === r3 && "!--" === e2 && (r3 = 4, h2 = h2[0]);
      }
      return p2(), h2;
    }(s2)), r2), arguments, [])).length > 1 ? r2 : r2[0];
  }

  // ../../node_modules/htm/preact/index.module.js
  var m2 = htm_module_default.bind(h);

  // node_modules/instantsearch.js/es/components/InternalHighlight/InternalHighlight.js
  var InternalHighlight = createHighlightComponent({
    createElement: h,
    Fragment: p
  });

  // node_modules/instantsearch.js/es/components/Highlight/Highlight.js
  var _excluded6 = ["classNames"];
  function _extends3() {
    _extends3 = Object.assign ? Object.assign.bind() : function(target) {
      for (var i2 = 1; i2 < arguments.length; i2++) {
        var source = arguments[i2];
        for (var key2 in source) {
          if (Object.prototype.hasOwnProperty.call(source, key2)) {
            target[key2] = source[key2];
          }
        }
      }
      return target;
    };
    return _extends3.apply(this, arguments);
  }
  function _objectWithoutProperties5(source, excluded) {
    if (source == null) return {};
    var target = _objectWithoutPropertiesLoose5(source, excluded);
    var key2, i2;
    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i2 = 0; i2 < sourceSymbolKeys.length; i2++) {
        key2 = sourceSymbolKeys[i2];
        if (excluded.indexOf(key2) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key2)) continue;
        target[key2] = source[key2];
      }
    }
    return target;
  }
  function _objectWithoutPropertiesLoose5(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key2, i2;
    for (i2 = 0; i2 < sourceKeys.length; i2++) {
      key2 = sourceKeys[i2];
      if (excluded.indexOf(key2) >= 0) continue;
      target[key2] = source[key2];
    }
    return target;
  }
  function Highlight(_ref) {
    var _ref$classNames = _ref.classNames, classNames = _ref$classNames === void 0 ? {} : _ref$classNames, props = _objectWithoutProperties5(_ref, _excluded6);
    return h(InternalHighlight, _extends3({
      classNames: {
        root: cx("ais-Highlight", classNames.root),
        highlighted: cx("ais-Highlight-highlighted", classNames.highlighted),
        nonHighlighted: cx("ais-Highlight-nonHighlighted", classNames.nonHighlighted),
        separator: cx("ais-Highlight-separator", classNames.separator)
      }
    }, props));
  }

  // node_modules/instantsearch.js/es/helpers/components/Highlight.js
  var _excluded7 = ["hit", "attribute", "cssClasses"];
  function _extends4() {
    _extends4 = Object.assign ? Object.assign.bind() : function(target) {
      for (var i2 = 1; i2 < arguments.length; i2++) {
        var source = arguments[i2];
        for (var key2 in source) {
          if (Object.prototype.hasOwnProperty.call(source, key2)) {
            target[key2] = source[key2];
          }
        }
      }
      return target;
    };
    return _extends4.apply(this, arguments);
  }
  function _objectWithoutProperties6(source, excluded) {
    if (source == null) return {};
    var target = _objectWithoutPropertiesLoose6(source, excluded);
    var key2, i2;
    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i2 = 0; i2 < sourceSymbolKeys.length; i2++) {
        key2 = sourceSymbolKeys[i2];
        if (excluded.indexOf(key2) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key2)) continue;
        target[key2] = source[key2];
      }
    }
    return target;
  }
  function _objectWithoutPropertiesLoose6(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key2, i2;
    for (i2 = 0; i2 < sourceKeys.length; i2++) {
      key2 = sourceKeys[i2];
      if (excluded.indexOf(key2) >= 0) continue;
      target[key2] = source[key2];
    }
    return target;
  }
  function Highlight2(_ref) {
    var hit = _ref.hit, attribute = _ref.attribute, cssClasses = _ref.cssClasses, props = _objectWithoutProperties6(_ref, _excluded7);
    var property = getPropertyByPath(hit._highlightResult, attribute) || [];
    var properties = toArray(property);
    true ? _warning(Boolean(properties.length), 'Could not enable highlight for "'.concat(attribute.toString(), '", will display an empty string.\nPlease check whether this attribute exists and is either searchable or specified in `attributesToHighlight`.\n\nSee: https://alg.li/highlighting\n')) : void 0;
    var parts = properties.map(function(_ref2) {
      var value = _ref2.value;
      return getHighlightedParts(unescape2(value || ""));
    });
    return h(Highlight, _extends4({}, props, {
      parts,
      classNames: cssClasses
    }));
  }

  // node_modules/instantsearch.js/es/components/ReverseHighlight/ReverseHighlight.js
  var _excluded8 = ["classNames"];
  function _extends5() {
    _extends5 = Object.assign ? Object.assign.bind() : function(target) {
      for (var i2 = 1; i2 < arguments.length; i2++) {
        var source = arguments[i2];
        for (var key2 in source) {
          if (Object.prototype.hasOwnProperty.call(source, key2)) {
            target[key2] = source[key2];
          }
        }
      }
      return target;
    };
    return _extends5.apply(this, arguments);
  }
  function _objectWithoutProperties7(source, excluded) {
    if (source == null) return {};
    var target = _objectWithoutPropertiesLoose7(source, excluded);
    var key2, i2;
    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i2 = 0; i2 < sourceSymbolKeys.length; i2++) {
        key2 = sourceSymbolKeys[i2];
        if (excluded.indexOf(key2) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key2)) continue;
        target[key2] = source[key2];
      }
    }
    return target;
  }
  function _objectWithoutPropertiesLoose7(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key2, i2;
    for (i2 = 0; i2 < sourceKeys.length; i2++) {
      key2 = sourceKeys[i2];
      if (excluded.indexOf(key2) >= 0) continue;
      target[key2] = source[key2];
    }
    return target;
  }
  function ReverseHighlight(_ref) {
    var _ref$classNames = _ref.classNames, classNames = _ref$classNames === void 0 ? {} : _ref$classNames, props = _objectWithoutProperties7(_ref, _excluded8);
    return h(InternalHighlight, _extends5({
      classNames: {
        root: cx("ais-ReverseHighlight", classNames.root),
        highlighted: cx("ais-ReverseHighlight-highlighted", classNames.highlighted),
        nonHighlighted: cx("ais-ReverseHighlight-nonHighlighted", classNames.nonHighlighted),
        separator: cx("ais-ReverseHighlight-separator", classNames.separator)
      }
    }, props));
  }

  // node_modules/instantsearch.js/es/helpers/components/ReverseHighlight.js
  function _typeof17(obj) {
    "@babel/helpers - typeof";
    return _typeof17 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof17(obj);
  }
  var _excluded9 = ["hit", "attribute", "cssClasses"];
  var _excluded22 = ["isHighlighted"];
  function _extends6() {
    _extends6 = Object.assign ? Object.assign.bind() : function(target) {
      for (var i2 = 1; i2 < arguments.length; i2++) {
        var source = arguments[i2];
        for (var key2 in source) {
          if (Object.prototype.hasOwnProperty.call(source, key2)) {
            target[key2] = source[key2];
          }
        }
      }
      return target;
    };
    return _extends6.apply(this, arguments);
  }
  function ownKeys13(object, enumerableOnly) {
    var keys2 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys2.push.apply(keys2, symbols);
    }
    return keys2;
  }
  function _objectSpread13(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys13(Object(source), true).forEach(function(key2) {
        _defineProperty14(target, key2, source[key2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys13(Object(source)).forEach(function(key2) {
        Object.defineProperty(target, key2, Object.getOwnPropertyDescriptor(source, key2));
      });
    }
    return target;
  }
  function _defineProperty14(obj, key2, value) {
    key2 = _toPropertyKey14(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey14(arg) {
    var key2 = _toPrimitive14(arg, "string");
    return _typeof17(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive14(input, hint) {
    if (_typeof17(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof17(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _objectWithoutProperties8(source, excluded) {
    if (source == null) return {};
    var target = _objectWithoutPropertiesLoose8(source, excluded);
    var key2, i2;
    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i2 = 0; i2 < sourceSymbolKeys.length; i2++) {
        key2 = sourceSymbolKeys[i2];
        if (excluded.indexOf(key2) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key2)) continue;
        target[key2] = source[key2];
      }
    }
    return target;
  }
  function _objectWithoutPropertiesLoose8(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key2, i2;
    for (i2 = 0; i2 < sourceKeys.length; i2++) {
      key2 = sourceKeys[i2];
      if (excluded.indexOf(key2) >= 0) continue;
      target[key2] = source[key2];
    }
    return target;
  }
  function ReverseHighlight2(_ref) {
    var hit = _ref.hit, attribute = _ref.attribute, cssClasses = _ref.cssClasses, props = _objectWithoutProperties8(_ref, _excluded9);
    var property = getPropertyByPath(hit._highlightResult, attribute) || [];
    var properties = toArray(property);
    true ? _warning(Boolean(properties.length), 'Could not enable highlight for "'.concat(attribute.toString(), '", will display an empty string.\nPlease check whether this attribute exists and is either searchable or specified in `attributesToHighlight`.\n\nSee: https://alg.li/highlighting\n')) : void 0;
    var parts = properties.map(function(_ref2) {
      var value = _ref2.value;
      return getHighlightedParts(unescape2(value || "")).map(function(_ref3) {
        var isHighlighted = _ref3.isHighlighted, rest = _objectWithoutProperties8(_ref3, _excluded22);
        return _objectSpread13(_objectSpread13({}, rest), {}, {
          isHighlighted: !isHighlighted
        });
      });
    });
    return h(ReverseHighlight, _extends6({}, props, {
      parts,
      classNames: cssClasses
    }));
  }

  // node_modules/instantsearch.js/es/components/ReverseSnippet/ReverseSnippet.js
  var _excluded10 = ["classNames"];
  function _extends7() {
    _extends7 = Object.assign ? Object.assign.bind() : function(target) {
      for (var i2 = 1; i2 < arguments.length; i2++) {
        var source = arguments[i2];
        for (var key2 in source) {
          if (Object.prototype.hasOwnProperty.call(source, key2)) {
            target[key2] = source[key2];
          }
        }
      }
      return target;
    };
    return _extends7.apply(this, arguments);
  }
  function _objectWithoutProperties9(source, excluded) {
    if (source == null) return {};
    var target = _objectWithoutPropertiesLoose9(source, excluded);
    var key2, i2;
    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i2 = 0; i2 < sourceSymbolKeys.length; i2++) {
        key2 = sourceSymbolKeys[i2];
        if (excluded.indexOf(key2) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key2)) continue;
        target[key2] = source[key2];
      }
    }
    return target;
  }
  function _objectWithoutPropertiesLoose9(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key2, i2;
    for (i2 = 0; i2 < sourceKeys.length; i2++) {
      key2 = sourceKeys[i2];
      if (excluded.indexOf(key2) >= 0) continue;
      target[key2] = source[key2];
    }
    return target;
  }
  function ReverseSnippet(_ref) {
    var _ref$classNames = _ref.classNames, classNames = _ref$classNames === void 0 ? {} : _ref$classNames, props = _objectWithoutProperties9(_ref, _excluded10);
    return h(InternalHighlight, _extends7({
      classNames: {
        root: cx("ais-ReverseSnippet", classNames.root),
        highlighted: cx("ais-ReverseSnippet-highlighted", classNames.highlighted),
        nonHighlighted: cx("ais-ReverseSnippet-nonHighlighted", classNames.nonHighlighted),
        separator: cx("ais-ReverseSnippet-separator", classNames.separator)
      }
    }, props));
  }

  // node_modules/instantsearch.js/es/helpers/components/ReverseSnippet.js
  function _typeof18(obj) {
    "@babel/helpers - typeof";
    return _typeof18 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof18(obj);
  }
  var _excluded11 = ["hit", "attribute", "cssClasses"];
  var _excluded23 = ["isHighlighted"];
  function _extends8() {
    _extends8 = Object.assign ? Object.assign.bind() : function(target) {
      for (var i2 = 1; i2 < arguments.length; i2++) {
        var source = arguments[i2];
        for (var key2 in source) {
          if (Object.prototype.hasOwnProperty.call(source, key2)) {
            target[key2] = source[key2];
          }
        }
      }
      return target;
    };
    return _extends8.apply(this, arguments);
  }
  function ownKeys14(object, enumerableOnly) {
    var keys2 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys2.push.apply(keys2, symbols);
    }
    return keys2;
  }
  function _objectSpread14(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys14(Object(source), true).forEach(function(key2) {
        _defineProperty15(target, key2, source[key2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys14(Object(source)).forEach(function(key2) {
        Object.defineProperty(target, key2, Object.getOwnPropertyDescriptor(source, key2));
      });
    }
    return target;
  }
  function _defineProperty15(obj, key2, value) {
    key2 = _toPropertyKey15(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey15(arg) {
    var key2 = _toPrimitive15(arg, "string");
    return _typeof18(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive15(input, hint) {
    if (_typeof18(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof18(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _objectWithoutProperties10(source, excluded) {
    if (source == null) return {};
    var target = _objectWithoutPropertiesLoose10(source, excluded);
    var key2, i2;
    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i2 = 0; i2 < sourceSymbolKeys.length; i2++) {
        key2 = sourceSymbolKeys[i2];
        if (excluded.indexOf(key2) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key2)) continue;
        target[key2] = source[key2];
      }
    }
    return target;
  }
  function _objectWithoutPropertiesLoose10(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key2, i2;
    for (i2 = 0; i2 < sourceKeys.length; i2++) {
      key2 = sourceKeys[i2];
      if (excluded.indexOf(key2) >= 0) continue;
      target[key2] = source[key2];
    }
    return target;
  }
  function ReverseSnippet2(_ref) {
    var hit = _ref.hit, attribute = _ref.attribute, cssClasses = _ref.cssClasses, props = _objectWithoutProperties10(_ref, _excluded11);
    var property = getPropertyByPath(hit._snippetResult, attribute) || [];
    var properties = toArray(property);
    true ? _warning(Boolean(properties.length), 'Could not enable snippet for "'.concat(attribute.toString(), '", will display an empty string.\nPlease check whether this attribute exists and is specified in `attributesToSnippet`.\n\nSee: https://alg.li/highlighting\n')) : void 0;
    var parts = properties.map(function(_ref2) {
      var value = _ref2.value;
      return getHighlightedParts(unescape2(value || "")).map(function(_ref3) {
        var isHighlighted = _ref3.isHighlighted, rest = _objectWithoutProperties10(_ref3, _excluded23);
        return _objectSpread14(_objectSpread14({}, rest), {}, {
          isHighlighted: !isHighlighted
        });
      });
    });
    return h(ReverseSnippet, _extends8({}, props, {
      parts,
      classNames: cssClasses
    }));
  }

  // node_modules/instantsearch.js/es/components/Snippet/Snippet.js
  var _excluded12 = ["classNames"];
  function _extends9() {
    _extends9 = Object.assign ? Object.assign.bind() : function(target) {
      for (var i2 = 1; i2 < arguments.length; i2++) {
        var source = arguments[i2];
        for (var key2 in source) {
          if (Object.prototype.hasOwnProperty.call(source, key2)) {
            target[key2] = source[key2];
          }
        }
      }
      return target;
    };
    return _extends9.apply(this, arguments);
  }
  function _objectWithoutProperties11(source, excluded) {
    if (source == null) return {};
    var target = _objectWithoutPropertiesLoose11(source, excluded);
    var key2, i2;
    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i2 = 0; i2 < sourceSymbolKeys.length; i2++) {
        key2 = sourceSymbolKeys[i2];
        if (excluded.indexOf(key2) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key2)) continue;
        target[key2] = source[key2];
      }
    }
    return target;
  }
  function _objectWithoutPropertiesLoose11(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key2, i2;
    for (i2 = 0; i2 < sourceKeys.length; i2++) {
      key2 = sourceKeys[i2];
      if (excluded.indexOf(key2) >= 0) continue;
      target[key2] = source[key2];
    }
    return target;
  }
  function Snippet(_ref) {
    var _ref$classNames = _ref.classNames, classNames = _ref$classNames === void 0 ? {} : _ref$classNames, props = _objectWithoutProperties11(_ref, _excluded12);
    return h(InternalHighlight, _extends9({
      classNames: {
        root: cx("ais-Snippet", classNames.root),
        highlighted: cx("ais-Snippet-highlighted", classNames.highlighted),
        nonHighlighted: cx("ais-Snippet-nonHighlighted", classNames.nonHighlighted),
        separator: cx("ais-Snippet-separator", classNames.separator)
      }
    }, props));
  }

  // node_modules/instantsearch.js/es/helpers/components/Snippet.js
  var _excluded13 = ["hit", "attribute", "cssClasses"];
  function _extends10() {
    _extends10 = Object.assign ? Object.assign.bind() : function(target) {
      for (var i2 = 1; i2 < arguments.length; i2++) {
        var source = arguments[i2];
        for (var key2 in source) {
          if (Object.prototype.hasOwnProperty.call(source, key2)) {
            target[key2] = source[key2];
          }
        }
      }
      return target;
    };
    return _extends10.apply(this, arguments);
  }
  function _objectWithoutProperties12(source, excluded) {
    if (source == null) return {};
    var target = _objectWithoutPropertiesLoose12(source, excluded);
    var key2, i2;
    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i2 = 0; i2 < sourceSymbolKeys.length; i2++) {
        key2 = sourceSymbolKeys[i2];
        if (excluded.indexOf(key2) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key2)) continue;
        target[key2] = source[key2];
      }
    }
    return target;
  }
  function _objectWithoutPropertiesLoose12(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key2, i2;
    for (i2 = 0; i2 < sourceKeys.length; i2++) {
      key2 = sourceKeys[i2];
      if (excluded.indexOf(key2) >= 0) continue;
      target[key2] = source[key2];
    }
    return target;
  }
  function Snippet2(_ref) {
    var hit = _ref.hit, attribute = _ref.attribute, cssClasses = _ref.cssClasses, props = _objectWithoutProperties12(_ref, _excluded13);
    var property = getPropertyByPath(hit._snippetResult, attribute) || [];
    var properties = toArray(property);
    true ? _warning(Boolean(properties.length), 'Could not enable snippet for "'.concat(attribute.toString(), '", will display an empty string.\nPlease check whether this attribute exists and is specified in `attributesToSnippet`.\n\nSee: https://alg.li/highlighting\n')) : void 0;
    var parts = properties.map(function(_ref2) {
      var value = _ref2.value;
      return getHighlightedParts(unescape2(value || ""));
    });
    return h(Snippet, _extends10({}, props, {
      parts,
      classNames: cssClasses
    }));
  }

  // node_modules/instantsearch.js/es/lib/templating/renderTemplate.js
  function _typeof19(obj) {
    "@babel/helpers - typeof";
    return _typeof19 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof19(obj);
  }
  function ownKeys15(object, enumerableOnly) {
    var keys2 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys2.push.apply(keys2, symbols);
    }
    return keys2;
  }
  function _objectSpread15(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys15(Object(source), true).forEach(function(key2) {
        _defineProperty16(target, key2, source[key2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys15(Object(source)).forEach(function(key2) {
        Object.defineProperty(target, key2, Object.getOwnPropertyDescriptor(source, key2));
      });
    }
    return target;
  }
  function _defineProperty16(obj, key2, value) {
    key2 = _toPropertyKey16(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey16(arg) {
    var key2 = _toPrimitive16(arg, "string");
    return _typeof19(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive16(input, hint) {
    if (_typeof19(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof19(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function transformHelpersToHogan() {
    var helpers = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    var compileOptions = arguments.length > 1 ? arguments[1] : void 0;
    var data = arguments.length > 2 ? arguments[2] : void 0;
    return Object.keys(helpers).reduce(function(acc, helperKey) {
      return _objectSpread15(_objectSpread15({}, acc), {}, _defineProperty16({}, helperKey, function() {
        var _this = this;
        return function(text) {
          var render = function render2(value) {
            return import_hogan.default.compile(value, compileOptions).render(_this);
          };
          return helpers[helperKey].call(data, text, render);
        };
      }));
    }, {});
  }
  function renderTemplate(_ref) {
    var templates = _ref.templates, templateKey = _ref.templateKey, compileOptions = _ref.compileOptions, helpers = _ref.helpers, data = _ref.data, bindEvent = _ref.bindEvent, sendEvent = _ref.sendEvent;
    var template = templates[templateKey];
    if (typeof template !== "string" && typeof template !== "function") {
      throw new Error("Template must be 'string' or 'function', was '".concat(_typeof19(template), "' (key: ").concat(templateKey, ")"));
    }
    if (typeof template === "function") {
      var params = bindEvent || {};
      params.html = m2;
      params.sendEvent = sendEvent;
      params.components = {
        Highlight: Highlight2,
        ReverseHighlight: ReverseHighlight2,
        Snippet: Snippet2,
        ReverseSnippet: ReverseSnippet2
      };
      return template(data, params);
    }
    var transformedHelpers = transformHelpersToHogan(helpers, compileOptions, data);
    return import_hogan.default.compile(template, compileOptions).render(_objectSpread15(_objectSpread15({}, data), {}, {
      helpers: transformedHelpers
    })).replace(/[ \n\r\t\f\xA0]+/g, function(spaces) {
      return spaces.replace(/(^|\xA0+)[^\xA0]+/g, "$1 ");
    }).trim();
  }

  // node_modules/instantsearch.js/es/components/Template/Template.js
  function _extends11() {
    _extends11 = Object.assign ? Object.assign.bind() : function(target) {
      for (var i2 = 1; i2 < arguments.length; i2++) {
        var source = arguments[i2];
        for (var key2 in source) {
          if (Object.prototype.hasOwnProperty.call(source, key2)) {
            target[key2] = source[key2];
          }
        }
      }
      return target;
    };
    return _extends11.apply(this, arguments);
  }
  function _typeof20(obj) {
    "@babel/helpers - typeof";
    return _typeof20 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof20(obj);
  }
  function _toConsumableArray4(arr) {
    return _arrayWithoutHoles4(arr) || _iterableToArray4(arr) || _unsupportedIterableToArray6(arr) || _nonIterableSpread4();
  }
  function _nonIterableSpread4() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray6(o2, minLen) {
    if (!o2) return;
    if (typeof o2 === "string") return _arrayLikeToArray6(o2, minLen);
    var n3 = Object.prototype.toString.call(o2).slice(8, -1);
    if (n3 === "Object" && o2.constructor) n3 = o2.constructor.name;
    if (n3 === "Map" || n3 === "Set") return Array.from(o2);
    if (n3 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n3)) return _arrayLikeToArray6(o2, minLen);
  }
  function _iterableToArray4(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
  function _arrayWithoutHoles4(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray6(arr);
  }
  function _arrayLikeToArray6(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i2 = 0, arr2 = new Array(len); i2 < len; i2++) arr2[i2] = arr[i2];
    return arr2;
  }
  function _classCallCheck2(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties2(target, props) {
    for (var i2 = 0; i2 < props.length; i2++) {
      var descriptor = props[i2];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey17(descriptor.key), descriptor);
    }
  }
  function _createClass2(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties2(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties2(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", { writable: false });
    return Constructor;
  }
  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
    Object.defineProperty(subClass, "prototype", { writable: false });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }
  function _setPrototypeOf(o2, p2) {
    _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf3(o3, p3) {
      o3.__proto__ = p3;
      return o3;
    };
    return _setPrototypeOf(o2, p2);
  }
  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();
    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived), result;
      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;
        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }
      return _possibleConstructorReturn(this, result);
    };
  }
  function _possibleConstructorReturn(self2, call) {
    if (call && (_typeof20(call) === "object" || typeof call === "function")) {
      return call;
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
    }
    return _assertThisInitialized(self2);
  }
  function _assertThisInitialized(self2) {
    if (self2 === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self2;
  }
  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;
    try {
      Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
      }));
      return true;
    } catch (e2) {
      return false;
    }
  }
  function _getPrototypeOf(o2) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf3(o3) {
      return o3.__proto__ || Object.getPrototypeOf(o3);
    };
    return _getPrototypeOf(o2);
  }
  function _defineProperty17(obj, key2, value) {
    key2 = _toPropertyKey17(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey17(arg) {
    var key2 = _toPrimitive17(arg, "string");
    return _typeof20(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive17(input, hint) {
    if (_typeof20(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof20(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  var RawHtml = /* @__PURE__ */ function(_Component) {
    _inherits(RawHtml2, _Component);
    var _super = _createSuper(RawHtml2);
    function RawHtml2() {
      var _this;
      _classCallCheck2(this, RawHtml2);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _super.call.apply(_super, [this].concat(args));
      _defineProperty17(_assertThisInitialized(_this), "ref", y());
      _defineProperty17(_assertThisInitialized(_this), "nodes", []);
      return _this;
    }
    _createClass2(RawHtml2, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var fragment = new DocumentFragment();
        var root = document.createElement("div");
        root.innerHTML = this.props.content;
        this.nodes = _toConsumableArray4(root.childNodes);
        this.nodes.forEach(function(node) {
          return fragment.appendChild(node);
        });
        this.ref.current.replaceWith(fragment);
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        this.nodes.forEach(function(node) {
          if (node instanceof Element) {
            node.outerHTML = "";
            return;
          }
          node.nodeValue = "";
        });
        if (this.nodes[0].nodeValue) {
          this.nodes[0].nodeValue = "";
        }
      }
    }, {
      key: "render",
      value: function render() {
        return h("div", {
          ref: this.ref
        });
      }
    }]);
    return RawHtml2;
  }(d);
  var defaultProps = {
    data: {},
    rootTagName: "div",
    useCustomCompileOptions: {},
    templates: {},
    templatesConfig: {}
  };
  var Template = /* @__PURE__ */ function(_Component2) {
    _inherits(Template2, _Component2);
    var _super2 = _createSuper(Template2);
    function Template2() {
      _classCallCheck2(this, Template2);
      return _super2.apply(this, arguments);
    }
    _createClass2(Template2, [{
      key: "shouldComponentUpdate",
      value: function shouldComponentUpdate(nextProps) {
        return !isEqual(this.props.data, nextProps.data) || this.props.templateKey !== nextProps.templateKey || !isEqual(this.props.rootProps, nextProps.rootProps);
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;
        if (true) {
          var nonFunctionTemplates = Object.keys(this.props.templates).filter(function(key2) {
            return typeof _this2.props.templates[key2] !== "function";
          });
          true ? _warning(nonFunctionTemplates.length === 0, "Hogan.js and string-based templates are deprecated and will not be supported in InstantSearch.js 5.x.\n\nYou can replace them with function-form templates and use either the provided `html` function or JSX templates.\n\nString-based templates: ".concat(nonFunctionTemplates.join(", "), ".\n\nSee: https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/js/#upgrade-templates")) : void 0;
        }
        var RootTagName = this.props.rootTagName === "fragment" ? p : this.props.rootTagName;
        var useCustomCompileOptions = this.props.useCustomCompileOptions[this.props.templateKey];
        var compileOptions = useCustomCompileOptions ? this.props.templatesConfig.compileOptions : {};
        var content = renderTemplate({
          templates: this.props.templates,
          templateKey: this.props.templateKey,
          compileOptions,
          helpers: this.props.templatesConfig.helpers,
          data: this.props.data,
          bindEvent: this.props.bindEvent,
          sendEvent: this.props.sendEvent
        });
        if (content === null) {
          return null;
        }
        if (_typeof20(content) === "object") {
          return h(RootTagName, this.props.rootProps, content);
        }
        if (RootTagName === p) {
          return h(RawHtml, {
            content,
            key: content
          });
        }
        return h(RootTagName, _extends11({}, this.props.rootProps, {
          dangerouslySetInnerHTML: {
            __html: content
          }
        }));
      }
    }]);
    return Template2;
  }(d);
  _defineProperty17(Template, "defaultProps", defaultProps);
  var Template_default = Template;

  // node_modules/instantsearch.js/es/components/Answers/Answers.js
  function _typeof21(obj) {
    "@babel/helpers - typeof";
    return _typeof21 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof21(obj);
  }
  function ownKeys16(object, enumerableOnly) {
    var keys2 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys2.push.apply(keys2, symbols);
    }
    return keys2;
  }
  function _objectSpread16(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys16(Object(source), true).forEach(function(key2) {
        _defineProperty18(target, key2, source[key2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys16(Object(source)).forEach(function(key2) {
        Object.defineProperty(target, key2, Object.getOwnPropertyDescriptor(source, key2));
      });
    }
    return target;
  }
  function _defineProperty18(obj, key2, value) {
    key2 = _toPropertyKey18(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey18(arg) {
    var key2 = _toPrimitive18(arg, "string");
    return _typeof21(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive18(input, hint) {
    if (_typeof21(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof21(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _extends12() {
    _extends12 = Object.assign ? Object.assign.bind() : function(target) {
      for (var i2 = 1; i2 < arguments.length; i2++) {
        var source = arguments[i2];
        for (var key2 in source) {
          if (Object.prototype.hasOwnProperty.call(source, key2)) {
            target[key2] = source[key2];
          }
        }
      }
      return target;
    };
    return _extends12.apply(this, arguments);
  }
  var Answers = function Answers2(_ref) {
    var hits2 = _ref.hits, isLoading = _ref.isLoading, cssClasses = _ref.cssClasses, templateProps = _ref.templateProps;
    return h("div", {
      className: cx(cssClasses.root, hits2.length === 0 && cssClasses.emptyRoot)
    }, h(Template_default, _extends12({}, templateProps, {
      templateKey: "header",
      rootProps: {
        className: cssClasses.header
      },
      data: {
        hits: hits2,
        isLoading
      }
    })), isLoading ? h(Template_default, _extends12({}, templateProps, {
      templateKey: "loader",
      rootProps: {
        className: cssClasses.loader
      }
    })) : h("ul", {
      className: cssClasses.list
    }, hits2.map(function(hit, index3) {
      return h(Template_default, _extends12({}, templateProps, {
        templateKey: "item",
        rootTagName: "li",
        rootProps: {
          className: cssClasses.item
        },
        key: hit.objectID,
        data: _objectSpread16(_objectSpread16({}, hit), {}, {
          get __hitIndex() {
            true ? _warning(false, "The `__hitIndex` property is deprecated. Use the absolute `__position` instead.") : void 0;
            return index3;
          }
        })
      }));
    })));
  };
  var Answers_default = Answers;

  // node_modules/instantsearch.js/es/connectors/answers/connectAnswers.js
  function _typeof22(obj) {
    "@babel/helpers - typeof";
    return _typeof22 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof22(obj);
  }
  function ownKeys17(object, enumerableOnly) {
    var keys2 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys2.push.apply(keys2, symbols);
    }
    return keys2;
  }
  function _objectSpread17(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys17(Object(source), true).forEach(function(key2) {
        _defineProperty19(target, key2, source[key2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys17(Object(source)).forEach(function(key2) {
        Object.defineProperty(target, key2, Object.getOwnPropertyDescriptor(source, key2));
      });
    }
    return target;
  }
  function _defineProperty19(obj, key2, value) {
    key2 = _toPropertyKey19(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey19(arg) {
    var key2 = _toPrimitive19(arg, "string");
    return _typeof22(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive19(input, hint) {
    if (_typeof22(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof22(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function hasFindAnswersMethod(answersIndex) {
    return typeof answersIndex.findAnswers === "function";
  }
  var withUsage = createDocumentationMessageGenerator({
    name: "answers",
    connector: true
  });
  var connectAnswers = function connectAnswers2(renderFn) {
    var unmountFn = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : noop;
    checkRendering(renderFn, withUsage());
    return function(widgetParams) {
      var _ref = widgetParams || {}, queryLanguages = _ref.queryLanguages, attributesForPrediction = _ref.attributesForPrediction, _ref$nbHits = _ref.nbHits, nbHits = _ref$nbHits === void 0 ? 1 : _ref$nbHits, _ref$renderDebounceTi = _ref.renderDebounceTime, renderDebounceTime = _ref$renderDebounceTi === void 0 ? 100 : _ref$renderDebounceTi, _ref$searchDebounceTi = _ref.searchDebounceTime, searchDebounceTime = _ref$searchDebounceTi === void 0 ? 100 : _ref$searchDebounceTi, _ref$escapeHTML = _ref.escapeHTML, escapeHTML = _ref$escapeHTML === void 0 ? true : _ref$escapeHTML, _ref$extraParameters = _ref.extraParameters, extraParameters = _ref$extraParameters === void 0 ? {} : _ref$extraParameters;
      if (!queryLanguages || queryLanguages.length === 0) {
        throw new Error(withUsage("The `queryLanguages` expects an array of strings."));
      }
      var runConcurrentSafePromise = createConcurrentSafePromise();
      var lastHits = [];
      var isLoading = false;
      var debouncedRender = debounce(renderFn, renderDebounceTime);
      var debouncedRefine;
      return {
        $$type: "ais.answers",
        init: function init(initOptions) {
          var state = initOptions.state, instantSearchInstance = initOptions.instantSearchInstance;
          var answersIndex = instantSearchInstance.client.initIndex(state.index);
          if (!hasFindAnswersMethod(answersIndex)) {
            throw new Error(withUsage("`algoliasearch` >= 4.8.0 required."));
          }
          debouncedRefine = debounce(answersIndex.findAnswers, searchDebounceTime);
          renderFn(_objectSpread17(_objectSpread17({}, this.getWidgetRenderState(initOptions)), {}, {
            instantSearchInstance: initOptions.instantSearchInstance
          }), true);
        },
        render: function render(renderOptions) {
          var _this = this;
          var query = renderOptions.state.query;
          if (!query) {
            lastHits = [];
            isLoading = false;
            renderFn(_objectSpread17(_objectSpread17({}, this.getWidgetRenderState(renderOptions)), {}, {
              instantSearchInstance: renderOptions.instantSearchInstance
            }), false);
            return;
          }
          lastHits = [];
          isLoading = true;
          renderFn(_objectSpread17(_objectSpread17({}, this.getWidgetRenderState(renderOptions)), {}, {
            instantSearchInstance: renderOptions.instantSearchInstance
          }), false);
          runConcurrentSafePromise(debouncedRefine(query, queryLanguages, _objectSpread17(_objectSpread17({}, extraParameters), {}, {
            nbHits,
            attributesForPrediction
          }))).then(function(result) {
            if (!result) {
              return;
            }
            if (escapeHTML && result.hits.length > 0) {
              result.hits = escapeHits(result.hits);
            }
            var hitsWithAbsolutePosition = addAbsolutePosition(result.hits, 0, nbHits);
            var hitsWithAbsolutePositionAndQueryID = addQueryID(hitsWithAbsolutePosition, result.queryID);
            lastHits = hitsWithAbsolutePositionAndQueryID;
            isLoading = false;
            debouncedRender(_objectSpread17(_objectSpread17({}, _this.getWidgetRenderState(renderOptions)), {}, {
              instantSearchInstance: renderOptions.instantSearchInstance
            }), false);
          });
        },
        getRenderState: function getRenderState(renderState, renderOptions) {
          return _objectSpread17(_objectSpread17({}, renderState), {}, {
            answers: this.getWidgetRenderState(renderOptions)
          });
        },
        getWidgetRenderState: function getWidgetRenderState() {
          return {
            hits: lastHits,
            isLoading,
            widgetParams
          };
        },
        dispose: function dispose(_ref2) {
          var state = _ref2.state;
          unmountFn();
          return state;
        },
        getWidgetSearchParameters: function getWidgetSearchParameters(state) {
          return state;
        }
      };
    };
  };
  var connectAnswers_default = connectAnswers;

  // node_modules/instantsearch.js/es/widgets/answers/defaultTemplates.js
  var defaultTemplates = {
    header: function header() {
      return "";
    },
    loader: function loader() {
      return "";
    },
    item: function item(_item) {
      return JSON.stringify(_item);
    }
  };
  var defaultTemplates_default = defaultTemplates;

  // node_modules/instantsearch.js/es/widgets/answers/answers.js
  function _typeof23(obj) {
    "@babel/helpers - typeof";
    return _typeof23 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof23(obj);
  }
  function ownKeys18(object, enumerableOnly) {
    var keys2 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys2.push.apply(keys2, symbols);
    }
    return keys2;
  }
  function _objectSpread18(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys18(Object(source), true).forEach(function(key2) {
        _defineProperty20(target, key2, source[key2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys18(Object(source)).forEach(function(key2) {
        Object.defineProperty(target, key2, Object.getOwnPropertyDescriptor(source, key2));
      });
    }
    return target;
  }
  function _defineProperty20(obj, key2, value) {
    key2 = _toPropertyKey20(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey20(arg) {
    var key2 = _toPrimitive20(arg, "string");
    return _typeof23(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive20(input, hint) {
    if (_typeof23(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof23(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  var withUsage2 = createDocumentationMessageGenerator({
    name: "answers"
  });
  var suit5 = component("Answers");
  var renderer = function renderer2(_ref) {
    var containerNode = _ref.containerNode, cssClasses = _ref.cssClasses, renderState = _ref.renderState, templates = _ref.templates;
    return function(_ref2, isFirstRendering) {
      var hits2 = _ref2.hits, isLoading = _ref2.isLoading, instantSearchInstance = _ref2.instantSearchInstance;
      if (isFirstRendering) {
        renderState.templateProps = prepareTemplateProps({
          defaultTemplates: defaultTemplates_default,
          templatesConfig: instantSearchInstance.templatesConfig,
          templates
        });
        return;
      }
      P(h(Answers_default, {
        cssClasses,
        hits: hits2,
        isLoading,
        templateProps: renderState.templateProps
      }), containerNode);
    };
  };
  var answersWidget = function answersWidget2(widgetParams) {
    var _ref3 = widgetParams || {}, container = _ref3.container, attributesForPrediction = _ref3.attributesForPrediction, queryLanguages = _ref3.queryLanguages, nbHits = _ref3.nbHits, searchDebounceTime = _ref3.searchDebounceTime, renderDebounceTime = _ref3.renderDebounceTime, escapeHTML = _ref3.escapeHTML, extraParameters = _ref3.extraParameters, _ref3$templates = _ref3.templates, templates = _ref3$templates === void 0 ? {} : _ref3$templates, _ref3$cssClasses = _ref3.cssClasses, userCssClasses = _ref3$cssClasses === void 0 ? {} : _ref3$cssClasses;
    if (!container) {
      throw new Error(withUsage2("The `container` option is required."));
    }
    var containerNode = getContainerNode(container);
    var cssClasses = {
      root: cx(suit5(), userCssClasses.root),
      emptyRoot: cx(suit5({
        modifierName: "empty"
      }), userCssClasses.emptyRoot),
      header: cx(suit5({
        descendantName: "header"
      }), userCssClasses.header),
      loader: cx(suit5({
        descendantName: "loader"
      }), userCssClasses.loader),
      list: cx(suit5({
        descendantName: "list"
      }), userCssClasses.list),
      item: cx(suit5({
        descendantName: "item"
      }), userCssClasses.item)
    };
    var specializedRenderer = renderer({
      containerNode,
      cssClasses,
      templates,
      renderState: {}
    });
    var makeWidget = connectAnswers_default(specializedRenderer, function() {
      return P(null, containerNode);
    });
    return _objectSpread18(_objectSpread18({}, makeWidget({
      attributesForPrediction,
      queryLanguages,
      nbHits,
      searchDebounceTime,
      renderDebounceTime,
      escapeHTML,
      extraParameters
    })), {}, {
      $$widgetType: "ais.answers"
    });
  };
  var answers_default = deprecate(answersWidget, "The answers widget is deprecated and will be removed in InstantSearch.js 5.0");

  // node_modules/instantsearch.js/es/connectors/dynamic-widgets/connectDynamicWidgets.js
  function ownKeys19(object, enumerableOnly) {
    var keys2 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys2.push.apply(keys2, symbols);
    }
    return keys2;
  }
  function _objectSpread19(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys19(Object(source), true).forEach(function(key2) {
        _defineProperty21(target, key2, source[key2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys19(Object(source)).forEach(function(key2) {
        Object.defineProperty(target, key2, Object.getOwnPropertyDescriptor(source, key2));
      });
    }
    return target;
  }
  function _defineProperty21(obj, key2, value) {
    key2 = _toPropertyKey21(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey21(arg) {
    var key2 = _toPrimitive21(arg, "string");
    return _typeof24(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive21(input, hint) {
    if (_typeof24(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof24(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _typeof24(obj) {
    "@babel/helpers - typeof";
    return _typeof24 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof24(obj);
  }
  var withUsage3 = createDocumentationMessageGenerator({
    name: "dynamic-widgets",
    connector: true
  });
  var MAX_WILDCARD_FACETS = 20;
  var connectDynamicWidgets = function connectDynamicWidgets2(renderFn) {
    var unmountFn = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : noop;
    checkRendering(renderFn, withUsage3());
    return function(widgetParams) {
      var widgets = widgetParams.widgets, _widgetParams$maxValu = widgetParams.maxValuesPerFacet, maxValuesPerFacet = _widgetParams$maxValu === void 0 ? 20 : _widgetParams$maxValu, _widgetParams$facets = widgetParams.facets, facets = _widgetParams$facets === void 0 ? ["*"] : _widgetParams$facets, _widgetParams$transfo = widgetParams.transformItems, transformItems = _widgetParams$transfo === void 0 ? function(items) {
        return items;
      } : _widgetParams$transfo, fallbackWidget = widgetParams.fallbackWidget;
      if (!(widgets && Array.isArray(widgets) && widgets.every(function(widget) {
        return _typeof24(widget) === "object";
      }))) {
        throw new Error(withUsage3("The `widgets` option expects an array of widgets."));
      }
      if (!Array.isArray(facets)) {
        throw new Error(withUsage3("The `facets` option only accepts an array of facets, you passed ".concat(JSON.stringify(facets))));
      }
      var localWidgets = /* @__PURE__ */ new Map();
      return {
        $$type: "ais.dynamicWidgets",
        init: function init(initOptions) {
          widgets.forEach(function(widget) {
            var attribute = getWidgetAttribute(widget, initOptions);
            localWidgets.set(attribute, {
              widget,
              isMounted: false
            });
          });
          renderFn(_objectSpread19(_objectSpread19({}, this.getWidgetRenderState(initOptions)), {}, {
            instantSearchInstance: initOptions.instantSearchInstance
          }), true);
        },
        render: function render(renderOptions) {
          var parent = renderOptions.parent;
          var renderState = this.getWidgetRenderState(renderOptions);
          var widgetsToUnmount = [];
          var widgetsToMount = [];
          if (fallbackWidget) {
            renderState.attributesToRender.forEach(function(attribute) {
              if (!localWidgets.has(attribute)) {
                var widget = fallbackWidget({
                  attribute
                });
                localWidgets.set(attribute, {
                  widget,
                  isMounted: false
                });
              }
            });
          }
          localWidgets.forEach(function(_ref, attribute) {
            var widget = _ref.widget, isMounted = _ref.isMounted;
            var shouldMount = renderState.attributesToRender.indexOf(attribute) > -1;
            if (!isMounted && shouldMount) {
              widgetsToMount.push(widget);
              localWidgets.set(attribute, {
                widget,
                isMounted: true
              });
            } else if (isMounted && !shouldMount) {
              widgetsToUnmount.push(widget);
              localWidgets.set(attribute, {
                widget,
                isMounted: false
              });
            }
          });
          parent.addWidgets(widgetsToMount);
          setTimeout(function() {
            return parent.removeWidgets(widgetsToUnmount);
          }, 0);
          renderFn(_objectSpread19(_objectSpread19({}, renderState), {}, {
            instantSearchInstance: renderOptions.instantSearchInstance
          }), false);
        },
        dispose: function dispose(_ref2) {
          var parent = _ref2.parent;
          var toRemove = [];
          localWidgets.forEach(function(_ref3) {
            var widget = _ref3.widget, isMounted = _ref3.isMounted;
            if (isMounted) {
              toRemove.push(widget);
            }
          });
          parent.removeWidgets(toRemove);
          unmountFn();
        },
        getWidgetSearchParameters: function getWidgetSearchParameters(state) {
          return facets.reduce(function(acc, curr) {
            return acc.addFacet(curr);
          }, state.setQueryParameters({
            maxValuesPerFacet: Math.max(maxValuesPerFacet || 0, state.maxValuesPerFacet || 0)
          }));
        },
        getRenderState: function getRenderState(renderState, renderOptions) {
          return _objectSpread19(_objectSpread19({}, renderState), {}, {
            dynamicWidgets: this.getWidgetRenderState(renderOptions)
          });
        },
        getWidgetRenderState: function getWidgetRenderState(_ref4) {
          var _results$renderingCon, _results$renderingCon2, _results$renderingCon3, _results$renderingCon4;
          var results = _ref4.results, state = _ref4.state;
          if (!results) {
            return {
              attributesToRender: [],
              widgetParams
            };
          }
          var attributesToRender = transformItems((_results$renderingCon = (_results$renderingCon2 = results.renderingContent) === null || _results$renderingCon2 === void 0 ? void 0 : (_results$renderingCon3 = _results$renderingCon2.facetOrdering) === null || _results$renderingCon3 === void 0 ? void 0 : (_results$renderingCon4 = _results$renderingCon3.facets) === null || _results$renderingCon4 === void 0 ? void 0 : _results$renderingCon4.order) !== null && _results$renderingCon !== void 0 ? _results$renderingCon : [], {
            results
          });
          if (!Array.isArray(attributesToRender)) {
            throw new Error(withUsage3("The `transformItems` option expects a function that returns an Array."));
          }
          true ? _warning(maxValuesPerFacet >= (state.maxValuesPerFacet || 0), "The maxValuesPerFacet set by dynamic widgets (".concat(maxValuesPerFacet, ") is smaller than one of the limits set by a widget (").concat(state.maxValuesPerFacet, "). This causes a mismatch in query parameters and thus an extra network request when that widget is mounted.")) : void 0;
          true ? _warning(attributesToRender.length <= MAX_WILDCARD_FACETS || widgetParams.facets !== void 0, "More than ".concat(MAX_WILDCARD_FACETS, ` facets are requested to be displayed without explicitly setting which facets to retrieve. This could have a performance impact. Set "facets" to [] to do two smaller network requests, or explicitly to ['*'] to avoid this warning.`)) : void 0;
          return {
            attributesToRender,
            widgetParams
          };
        }
      };
    };
  };
  var connectDynamicWidgets_default = connectDynamicWidgets;

  // node_modules/instantsearch.js/es/widgets/dynamic-widgets/dynamic-widgets.js
  function _typeof25(obj) {
    "@babel/helpers - typeof";
    return _typeof25 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof25(obj);
  }
  var _excluded14 = ["container", "widgets", "fallbackWidget"];
  function ownKeys20(object, enumerableOnly) {
    var keys2 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys2.push.apply(keys2, symbols);
    }
    return keys2;
  }
  function _objectSpread20(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys20(Object(source), true).forEach(function(key2) {
        _defineProperty22(target, key2, source[key2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys20(Object(source)).forEach(function(key2) {
        Object.defineProperty(target, key2, Object.getOwnPropertyDescriptor(source, key2));
      });
    }
    return target;
  }
  function _defineProperty22(obj, key2, value) {
    key2 = _toPropertyKey22(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey22(arg) {
    var key2 = _toPrimitive22(arg, "string");
    return _typeof25(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive22(input, hint) {
    if (_typeof25(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof25(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _objectWithoutProperties13(source, excluded) {
    if (source == null) return {};
    var target = _objectWithoutPropertiesLoose13(source, excluded);
    var key2, i2;
    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i2 = 0; i2 < sourceSymbolKeys.length; i2++) {
        key2 = sourceSymbolKeys[i2];
        if (excluded.indexOf(key2) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key2)) continue;
        target[key2] = source[key2];
      }
    }
    return target;
  }
  function _objectWithoutPropertiesLoose13(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key2, i2;
    for (i2 = 0; i2 < sourceKeys.length; i2++) {
      key2 = sourceKeys[i2];
      if (excluded.indexOf(key2) >= 0) continue;
      target[key2] = source[key2];
    }
    return target;
  }
  var withUsage4 = createDocumentationMessageGenerator({
    name: "dynamic-widgets"
  });
  var suit6 = component("DynamicWidgets");
  function createContainer(rootContainer) {
    var container = document.createElement("div");
    container.className = suit6({
      descendantName: "widget"
    });
    rootContainer.appendChild(container);
    return container;
  }
  var dynamicWidgets = function dynamicWidgets2(widgetParams) {
    var _ref = widgetParams || {}, containerSelector = _ref.container, widgets = _ref.widgets, fallbackWidget = _ref.fallbackWidget, otherWidgetParams = _objectWithoutProperties13(_ref, _excluded14);
    if (!containerSelector) {
      throw new Error(withUsage4("The `container` option is required."));
    }
    if (!(widgets && Array.isArray(widgets) && widgets.every(function(widget2) {
      return typeof widget2 === "function";
    }))) {
      throw new Error(withUsage4("The `widgets` option expects an array of callbacks."));
    }
    var userContainer = getContainerNode(containerSelector);
    var rootContainer = document.createElement("div");
    rootContainer.className = suit6();
    var containers = /* @__PURE__ */ new Map();
    var connectorWidgets = [];
    var makeWidget = connectDynamicWidgets_default(function(_ref2, isFirstRender) {
      var attributesToRender = _ref2.attributesToRender;
      if (isFirstRender) {
        userContainer.appendChild(rootContainer);
      }
      attributesToRender.forEach(function(attribute) {
        if (!containers.has(attribute)) {
          return;
        }
        var container = containers.get(attribute);
        rootContainer.appendChild(container);
      });
    }, function() {
      userContainer.removeChild(rootContainer);
    });
    var widget = makeWidget(_objectSpread20(_objectSpread20({}, otherWidgetParams), {}, {
      widgets: connectorWidgets,
      fallbackWidget: typeof fallbackWidget === "function" ? function(_ref3) {
        var attribute = _ref3.attribute;
        var container = createContainer(rootContainer);
        containers.set(attribute, container);
        return fallbackWidget({
          attribute,
          container
        });
      } : void 0
    }));
    return _objectSpread20(_objectSpread20({}, widget), {}, {
      init: function init(initOptions) {
        widgets.forEach(function(cb) {
          var container = createContainer(rootContainer);
          var childWidget = cb(container);
          var attribute = getWidgetAttribute(childWidget, initOptions);
          containers.set(attribute, container);
          connectorWidgets.push(childWidget);
        });
        widget.init(initOptions);
      },
      $$widgetType: "ais.dynamicWidgets"
    });
  };
  var dynamic_widgets_default = dynamicWidgets;

  // node_modules/instantsearch.js/es/lib/formatNumber.js
  function formatNumber(value, numberLocale) {
    return value.toLocaleString(numberLocale);
  }

  // node_modules/instantsearch.js/es/connectors/hits/connectHits.js
  function _typeof26(obj) {
    "@babel/helpers - typeof";
    return _typeof26 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof26(obj);
  }
  function ownKeys21(object, enumerableOnly) {
    var keys2 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys2.push.apply(keys2, symbols);
    }
    return keys2;
  }
  function _objectSpread21(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys21(Object(source), true).forEach(function(key2) {
        _defineProperty23(target, key2, source[key2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys21(Object(source)).forEach(function(key2) {
        Object.defineProperty(target, key2, Object.getOwnPropertyDescriptor(source, key2));
      });
    }
    return target;
  }
  function _defineProperty23(obj, key2, value) {
    key2 = _toPropertyKey23(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey23(arg) {
    var key2 = _toPrimitive23(arg, "string");
    return _typeof26(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive23(input, hint) {
    if (_typeof26(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof26(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  var withUsage5 = createDocumentationMessageGenerator({
    name: "hits",
    connector: true
  });
  var connectHits_default = function connectHits(renderFn) {
    var unmountFn = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : noop;
    checkRendering(renderFn, withUsage5());
    return function(widgetParams) {
      var _ref = widgetParams || {}, _ref$escapeHTML = _ref.escapeHTML, escapeHTML = _ref$escapeHTML === void 0 ? true : _ref$escapeHTML, _ref$transformItems = _ref.transformItems, transformItems = _ref$transformItems === void 0 ? function(items) {
        return items;
      } : _ref$transformItems;
      var sendEvent;
      var bindEvent;
      return {
        $$type: "ais.hits",
        init: function init(initOptions) {
          renderFn(_objectSpread21(_objectSpread21({}, this.getWidgetRenderState(initOptions)), {}, {
            instantSearchInstance: initOptions.instantSearchInstance
          }), true);
        },
        render: function render(renderOptions) {
          var renderState = this.getWidgetRenderState(renderOptions);
          renderFn(_objectSpread21(_objectSpread21({}, renderState), {}, {
            instantSearchInstance: renderOptions.instantSearchInstance
          }), false);
          renderState.sendEvent("view:internal", renderState.items);
        },
        getRenderState: function getRenderState(renderState, renderOptions) {
          return _objectSpread21(_objectSpread21({}, renderState), {}, {
            hits: this.getWidgetRenderState(renderOptions)
          });
        },
        getWidgetRenderState: function getWidgetRenderState(_ref2) {
          var _results$renderingCon, _results$renderingCon2, _results$renderingCon3;
          var results = _ref2.results, helper = _ref2.helper, instantSearchInstance = _ref2.instantSearchInstance;
          if (!sendEvent) {
            sendEvent = createSendEventForHits({
              instantSearchInstance,
              getIndex: function getIndex() {
                return helper.getIndex();
              },
              widgetType: this.$$type
            });
          }
          if (!bindEvent) {
            bindEvent = createBindEventForHits({
              getIndex: function getIndex() {
                return helper.getIndex();
              },
              widgetType: this.$$type,
              instantSearchInstance
            });
          }
          if (!results) {
            return {
              hits: [],
              items: [],
              results: void 0,
              banner: void 0,
              sendEvent,
              bindEvent,
              widgetParams
            };
          }
          if (escapeHTML && results.hits.length > 0) {
            results.hits = escapeHits(results.hits);
          }
          var hitsWithAbsolutePosition = addAbsolutePosition(results.hits, results.page, results.hitsPerPage);
          var hitsWithAbsolutePositionAndQueryID = addQueryID(hitsWithAbsolutePosition, results.queryID);
          var items = transformItems(hitsWithAbsolutePositionAndQueryID, {
            results
          });
          var banner = (_results$renderingCon = results.renderingContent) === null || _results$renderingCon === void 0 ? void 0 : (_results$renderingCon2 = _results$renderingCon.widgets) === null || _results$renderingCon2 === void 0 ? void 0 : (_results$renderingCon3 = _results$renderingCon2.banners) === null || _results$renderingCon3 === void 0 ? void 0 : _results$renderingCon3[0];
          return {
            hits: items,
            items,
            results,
            banner,
            sendEvent,
            bindEvent,
            widgetParams
          };
        },
        dispose: function dispose(_ref3) {
          var state = _ref3.state;
          unmountFn();
          if (!escapeHTML) {
            return state;
          }
          return state.setQueryParameters(Object.keys(TAG_PLACEHOLDER).reduce(function(acc, key2) {
            return _objectSpread21(_objectSpread21({}, acc), {}, _defineProperty23({}, key2, void 0));
          }, {}));
        },
        getWidgetSearchParameters: function getWidgetSearchParameters(state, _uiState) {
          if (!escapeHTML) {
            return state;
          }
          return state.setQueryParameters(TAG_PLACEHOLDER);
        }
      };
    };
  };

  // node_modules/instantsearch.js/es/lib/insights/client.js
  function _typeof27(obj) {
    "@babel/helpers - typeof";
    return _typeof27 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof27(obj);
  }
  function ownKeys22(object, enumerableOnly) {
    var keys2 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys2.push.apply(keys2, symbols);
    }
    return keys2;
  }
  function _objectSpread22(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys22(Object(source), true).forEach(function(key2) {
        _defineProperty24(target, key2, source[key2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys22(Object(source)).forEach(function(key2) {
        Object.defineProperty(target, key2, Object.getOwnPropertyDescriptor(source, key2));
      });
    }
    return target;
  }
  function _defineProperty24(obj, key2, value) {
    key2 = _toPropertyKey24(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey24(arg) {
    var key2 = _toPrimitive24(arg, "string");
    return _typeof27(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive24(input, hint) {
    if (_typeof27(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof27(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  var getSelectedHits = function getSelectedHits2(hits2, selectedObjectIDs) {
    return selectedObjectIDs.map(function(objectID) {
      var hit = find(hits2, function(h2) {
        return h2.objectID === objectID;
      });
      if (typeof hit === "undefined") {
        throw new Error('Could not find objectID "'.concat(objectID, '" passed to `clickedObjectIDsAfterSearch` in the returned hits. This is necessary to infer the absolute position and the query ID.'));
      }
      return hit;
    });
  };
  var getQueryID = function getQueryID2(selectedHits) {
    var queryIDs = uniq(selectedHits.map(function(hit) {
      return hit.__queryID;
    }));
    if (queryIDs.length > 1) {
      throw new Error("Insights currently allows a single `queryID`. The `objectIDs` provided map to multiple `queryID`s.");
    }
    var queryID = queryIDs[0];
    if (typeof queryID !== "string") {
      throw new Error("Could not infer `queryID`. Ensure InstantSearch `clickAnalytics: true` was added with the Configure widget.\n\nSee: https://alg.li/lNiZZ7");
    }
    return queryID;
  };
  var getPositions = function getPositions2(selectedHits) {
    return selectedHits.map(function(hit) {
      return hit.__position;
    });
  };
  var inferPayload = function inferPayload2(_ref) {
    var method = _ref.method, results = _ref.results, hits2 = _ref.hits, objectIDs = _ref.objectIDs;
    var index3 = results.index;
    var selectedHits = getSelectedHits(hits2, objectIDs);
    var queryID = getQueryID(selectedHits);
    switch (method) {
      case "clickedObjectIDsAfterSearch": {
        var positions = getPositions(selectedHits);
        return {
          index: index3,
          queryID,
          objectIDs,
          positions
        };
      }
      case "convertedObjectIDsAfterSearch":
        return {
          index: index3,
          queryID,
          objectIDs
        };
      default:
        throw new Error('Unsupported method passed to insights: "'.concat(method, '".'));
    }
  };
  var wrapInsightsClient = function wrapInsightsClient2(aa, results, hits2) {
    return function(method) {
      for (var _len = arguments.length, payloads = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        payloads[_key - 1] = arguments[_key];
      }
      var payload = payloads[0];
      true ? _warning(false, "`insights` function has been deprecated. It is still supported in 4.x releases, but not further. It is replaced by the `insights` middleware.\n\nFor more information, visit https://www.algolia.com/doc/guides/getting-insights-and-analytics/search-analytics/click-through-and-conversions/how-to/send-click-and-conversion-events-with-instantsearch/js/") : void 0;
      if (!aa) {
        var withInstantSearchUsage = createDocumentationMessageGenerator({
          name: "instantsearch"
        });
        throw new Error(withInstantSearchUsage("The `insightsClient` option has not been provided to `instantsearch`."));
      }
      if (!Array.isArray(payload.objectIDs)) {
        throw new TypeError("Expected `objectIDs` to be an array.");
      }
      var inferredPayload = inferPayload({
        method,
        results,
        hits: hits2,
        objectIDs: payload.objectIDs
      });
      aa(method, _objectSpread22(_objectSpread22({}, inferredPayload), payload));
    };
  };
  function withInsights(connector) {
    return function(renderFn, unmountFn) {
      return connector(function(renderOptions, isFirstRender) {
        var results = renderOptions.results, hits2 = renderOptions.hits, instantSearchInstance = renderOptions.instantSearchInstance;
        if (results && hits2 && instantSearchInstance) {
          var insights2 = wrapInsightsClient(instantSearchInstance.insightsClient, results, hits2);
          return renderFn(_objectSpread22(_objectSpread22({}, renderOptions), {}, {
            insights: insights2
          }), isFirstRender);
        }
        return renderFn(renderOptions, isFirstRender);
      }, unmountFn);
    };
  }

  // node_modules/instantsearch.js/es/lib/insights/listener.js
  var createInsightsEventHandler = function createInsightsEventHandler2(_ref) {
    var insights2 = _ref.insights, sendEvent = _ref.sendEvent;
    return function(event) {
      var insightsThroughSendEvent = findInsightsTarget(event.target, event.currentTarget, function(element) {
        return element.hasAttribute("data-insights-event");
      });
      if (insightsThroughSendEvent) {
        var payload = parseInsightsEvent(insightsThroughSendEvent);
        payload.forEach(function(single) {
          return sendEvent(single);
        });
      }
      var insightsThroughFunction = findInsightsTarget(event.target, event.currentTarget, function(element) {
        return element.hasAttribute("data-insights-method") && element.hasAttribute("data-insights-payload");
      });
      if (insightsThroughFunction) {
        var _readDataAttributes = readDataAttributes(insightsThroughFunction), method = _readDataAttributes.method, _payload = _readDataAttributes.payload;
        insights2(method, _payload);
      }
    };
  };
  function findInsightsTarget(startElement, endElement, validator) {
    var element = startElement;
    while (element && !validator(element)) {
      if (element === endElement) {
        return null;
      }
      element = element.parentElement;
    }
    return element;
  }
  function parseInsightsEvent(element) {
    var serializedPayload = element.getAttribute("data-insights-event");
    if (typeof serializedPayload !== "string") {
      throw new Error("The insights middleware expects `data-insights-event` to be a base64-encoded JSON string.");
    }
    try {
      return deserializePayload(serializedPayload);
    } catch (error) {
      throw new Error("The insights middleware was unable to parse `data-insights-event`.");
    }
  }

  // node_modules/instantsearch.js/es/widgets/hits/defaultTemplates.js
  var defaultTemplates2 = {
    empty: function empty() {
      return "No results";
    },
    item: function item2(data) {
      return JSON.stringify(omit(data, ["__hitIndex"]), null, 2);
    }
  };
  var defaultTemplates_default2 = defaultTemplates2;

  // node_modules/instantsearch.js/es/widgets/hits/hits.js
  function _typeof28(obj) {
    "@babel/helpers - typeof";
    return _typeof28 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof28(obj);
  }
  var _excluded15 = ["hit", "index"];
  function ownKeys23(object, enumerableOnly) {
    var keys2 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys2.push.apply(keys2, symbols);
    }
    return keys2;
  }
  function _objectSpread23(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys23(Object(source), true).forEach(function(key2) {
        _defineProperty25(target, key2, source[key2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys23(Object(source)).forEach(function(key2) {
        Object.defineProperty(target, key2, Object.getOwnPropertyDescriptor(source, key2));
      });
    }
    return target;
  }
  function _defineProperty25(obj, key2, value) {
    key2 = _toPropertyKey25(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey25(arg) {
    var key2 = _toPrimitive25(arg, "string");
    return _typeof28(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive25(input, hint) {
    if (_typeof28(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof28(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _objectWithoutProperties14(source, excluded) {
    if (source == null) return {};
    var target = _objectWithoutPropertiesLoose14(source, excluded);
    var key2, i2;
    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i2 = 0; i2 < sourceSymbolKeys.length; i2++) {
        key2 = sourceSymbolKeys[i2];
        if (excluded.indexOf(key2) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key2)) continue;
        target[key2] = source[key2];
      }
    }
    return target;
  }
  function _objectWithoutPropertiesLoose14(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key2, i2;
    for (i2 = 0; i2 < sourceKeys.length; i2++) {
      key2 = sourceKeys[i2];
      if (excluded.indexOf(key2) >= 0) continue;
      target[key2] = source[key2];
    }
    return target;
  }
  function _objectDestructuringEmpty2(obj) {
    if (obj == null) throw new TypeError("Cannot destructure " + obj);
  }
  function _extends13() {
    _extends13 = Object.assign ? Object.assign.bind() : function(target) {
      for (var i2 = 1; i2 < arguments.length; i2++) {
        var source = arguments[i2];
        for (var key2 in source) {
          if (Object.prototype.hasOwnProperty.call(source, key2)) {
            target[key2] = source[key2];
          }
        }
      }
      return target;
    };
    return _extends13.apply(this, arguments);
  }
  var withUsage6 = createDocumentationMessageGenerator({
    name: "hits"
  });
  var Hits = createHitsComponent({
    createElement: h,
    Fragment: p
  });
  var renderer3 = function renderer4(_ref) {
    var renderState = _ref.renderState, cssClasses = _ref.cssClasses, containerNode = _ref.containerNode, templates = _ref.templates;
    return function(_ref2, isFirstRendering) {
      var items = _ref2.items, results = _ref2.results, instantSearchInstance = _ref2.instantSearchInstance, insights2 = _ref2.insights, bindEvent = _ref2.bindEvent, sendEvent = _ref2.sendEvent, banner = _ref2.banner;
      if (isFirstRendering) {
        renderState.templateProps = prepareTemplateProps({
          defaultTemplates: defaultTemplates_default2,
          templatesConfig: instantSearchInstance.templatesConfig,
          templates
        });
        return;
      }
      var handleInsightsClick = createInsightsEventHandler({
        insights: insights2,
        sendEvent
      });
      var emptyComponent = function emptyComponent2(_ref3) {
        var rootProps = _extends13({}, (_objectDestructuringEmpty2(_ref3), _ref3));
        return h(Template_default, _extends13({}, renderState.templateProps, {
          rootProps,
          templateKey: "empty",
          data: results,
          rootTagName: "fragment"
        }));
      };
      var itemComponent = function itemComponent2(_ref4) {
        var hit = _ref4.hit, index3 = _ref4.index, rootProps = _objectWithoutProperties14(_ref4, _excluded15);
        return h(Template_default, _extends13({}, renderState.templateProps, {
          templateKey: "item",
          rootTagName: "li",
          rootProps: _objectSpread23(_objectSpread23({}, rootProps), {}, {
            onClick: function onClick(event) {
              handleInsightsClick(event);
              rootProps.onClick();
            },
            onAuxClick: function onAuxClick(event) {
              handleInsightsClick(event);
              rootProps.onAuxClick();
            }
          }),
          data: _objectSpread23(_objectSpread23({}, hit), {}, {
            get __hitIndex() {
              true ? _warning(false, "The `__hitIndex` property is deprecated. Use the absolute `__position` instead.") : void 0;
              return index3;
            }
          }),
          bindEvent,
          sendEvent
        }));
      };
      var bannerComponent = function bannerComponent2(props) {
        return h(Template_default, _extends13({}, renderState.templateProps, {
          templateKey: "banner",
          data: props,
          rootTagName: "fragment"
        }));
      };
      P(h(Hits, {
        hits: items,
        itemComponent,
        sendEvent,
        classNames: cssClasses,
        emptyComponent,
        banner,
        bannerComponent: templates.banner ? bannerComponent : void 0
      }), containerNode);
    };
  };
  var hits_default = function hits(widgetParams) {
    var _ref5 = widgetParams || {}, container = _ref5.container, escapeHTML = _ref5.escapeHTML, transformItems = _ref5.transformItems, _ref5$templates = _ref5.templates, templates = _ref5$templates === void 0 ? {} : _ref5$templates, _ref5$cssClasses = _ref5.cssClasses, cssClasses = _ref5$cssClasses === void 0 ? {} : _ref5$cssClasses;
    if (!container) {
      throw new Error(withUsage6("The `container` option is required."));
    }
    var containerNode = getContainerNode(container);
    var specializedRenderer = renderer3({
      containerNode,
      cssClasses,
      renderState: {},
      templates
    });
    var makeWidget = withInsights(connectHits_default)(specializedRenderer, function() {
      return P(null, containerNode);
    });
    return _objectSpread23(_objectSpread23({}, makeWidget({
      escapeHTML,
      transformItems
    })), {}, {
      $$widgetType: "ais.hits"
    });
  };

  // node_modules/instantsearch.js/es/widgets/index/index.js
  var import_algoliasearch_helper = __toESM(require_algoliasearch_helper2(), 1);
  function _typeof29(obj) {
    "@babel/helpers - typeof";
    return _typeof29 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof29(obj);
  }
  var _excluded16 = ["initialSearchParameters"];
  var _excluded24 = ["initialRecommendParameters"];
  function ownKeys24(object, enumerableOnly) {
    var keys2 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys2.push.apply(keys2, symbols);
    }
    return keys2;
  }
  function _objectSpread24(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys24(Object(source), true).forEach(function(key2) {
        _defineProperty26(target, key2, source[key2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys24(Object(source)).forEach(function(key2) {
        Object.defineProperty(target, key2, Object.getOwnPropertyDescriptor(source, key2));
      });
    }
    return target;
  }
  function _defineProperty26(obj, key2, value) {
    key2 = _toPropertyKey26(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey26(arg) {
    var key2 = _toPrimitive26(arg, "string");
    return _typeof29(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive26(input, hint) {
    if (_typeof29(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof29(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toConsumableArray5(arr) {
    return _arrayWithoutHoles5(arr) || _iterableToArray5(arr) || _unsupportedIterableToArray7(arr) || _nonIterableSpread5();
  }
  function _nonIterableSpread5() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray7(o2, minLen) {
    if (!o2) return;
    if (typeof o2 === "string") return _arrayLikeToArray7(o2, minLen);
    var n3 = Object.prototype.toString.call(o2).slice(8, -1);
    if (n3 === "Object" && o2.constructor) n3 = o2.constructor.name;
    if (n3 === "Map" || n3 === "Set") return Array.from(o2);
    if (n3 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n3)) return _arrayLikeToArray7(o2, minLen);
  }
  function _iterableToArray5(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
  function _arrayWithoutHoles5(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray7(arr);
  }
  function _arrayLikeToArray7(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i2 = 0, arr2 = new Array(len); i2 < len; i2++) arr2[i2] = arr[i2];
    return arr2;
  }
  function _objectWithoutProperties15(source, excluded) {
    if (source == null) return {};
    var target = _objectWithoutPropertiesLoose15(source, excluded);
    var key2, i2;
    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i2 = 0; i2 < sourceSymbolKeys.length; i2++) {
        key2 = sourceSymbolKeys[i2];
        if (excluded.indexOf(key2) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key2)) continue;
        target[key2] = source[key2];
      }
    }
    return target;
  }
  function _objectWithoutPropertiesLoose15(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key2, i2;
    for (i2 = 0; i2 < sourceKeys.length; i2++) {
      key2 = sourceKeys[i2];
      if (excluded.indexOf(key2) >= 0) continue;
      target[key2] = source[key2];
    }
    return target;
  }
  var withUsage7 = createDocumentationMessageGenerator({
    name: "index-widget"
  });
  function privateHelperSetState(helper, _ref) {
    var state = _ref.state, recommendState = _ref.recommendState, isPageReset = _ref.isPageReset, _uiState = _ref._uiState;
    if (state !== helper.state) {
      helper.state = state;
      helper.emit("change", {
        state: helper.state,
        results: helper.lastResults,
        isPageReset,
        _uiState
      });
    }
    if (recommendState !== helper.recommendState) {
      helper.recommendState = recommendState;
    }
  }
  function getLocalWidgetsUiState(widgets, widgetStateOptions) {
    var initialUiState = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    return widgets.reduce(function(uiState, widget) {
      if (isIndexWidget(widget)) {
        return uiState;
      }
      if (!widget.getWidgetUiState && !widget.getWidgetState) {
        return uiState;
      }
      if (widget.getWidgetUiState) {
        return widget.getWidgetUiState(uiState, widgetStateOptions);
      }
      return widget.getWidgetState(uiState, widgetStateOptions);
    }, initialUiState);
  }
  function getLocalWidgetsSearchParameters(widgets, widgetSearchParametersOptions) {
    var initialSearchParameters = widgetSearchParametersOptions.initialSearchParameters, rest = _objectWithoutProperties15(widgetSearchParametersOptions, _excluded16);
    return widgets.reduce(function(state, widget) {
      if (!widget.getWidgetSearchParameters || isIndexWidget(widget)) {
        return state;
      }
      if (widget.dependsOn === "search" && widget.getWidgetParameters) {
        return widget.getWidgetParameters(state, rest);
      }
      return widget.getWidgetSearchParameters(state, rest);
    }, initialSearchParameters);
  }
  function getLocalWidgetsRecommendParameters(widgets, widgetRecommendParametersOptions) {
    var initialRecommendParameters = widgetRecommendParametersOptions.initialRecommendParameters, rest = _objectWithoutProperties15(widgetRecommendParametersOptions, _excluded24);
    return widgets.reduce(function(state, widget) {
      if (!isIndexWidget(widget) && widget.dependsOn === "recommend" && widget.getWidgetParameters) {
        return widget.getWidgetParameters(state, rest);
      }
      return state;
    }, initialRecommendParameters);
  }
  function resetPageFromWidgets(widgets) {
    var indexWidgets = widgets.filter(isIndexWidget);
    if (indexWidgets.length === 0) {
      return;
    }
    indexWidgets.forEach(function(widget) {
      var widgetHelper = widget.getHelper();
      privateHelperSetState(widgetHelper, {
        state: widgetHelper.state.resetPage(),
        recommendState: widgetHelper.recommendState,
        isPageReset: true
      });
      resetPageFromWidgets(widget.getWidgets());
    });
  }
  function resolveScopedResultsFromWidgets(widgets) {
    var indexWidgets = widgets.filter(isIndexWidget);
    return indexWidgets.reduce(function(scopedResults, current) {
      return scopedResults.concat.apply(scopedResults, [{
        indexId: current.getIndexId(),
        results: current.getResults(),
        helper: current.getHelper()
      }].concat(_toConsumableArray5(resolveScopedResultsFromWidgets(current.getWidgets()))));
    }, []);
  }
  var index = function index2(widgetParams) {
    if (widgetParams === void 0 || widgetParams.indexName === void 0) {
      throw new Error(withUsage7("The `indexName` option is required."));
    }
    var indexName = widgetParams.indexName, _widgetParams$indexId = widgetParams.indexId, indexId = _widgetParams$indexId === void 0 ? indexName : _widgetParams$indexId;
    var localWidgets = [];
    var localUiState = {};
    var localInstantSearchInstance = null;
    var localParent = null;
    var helper = null;
    var derivedHelper = null;
    var lastValidSearchParameters = null;
    var hasRecommendWidget = false;
    var hasSearchWidget = false;
    return {
      $$type: "ais.index",
      $$widgetType: "ais.index",
      getIndexName: function getIndexName() {
        return indexName;
      },
      getIndexId: function getIndexId() {
        return indexId;
      },
      getHelper: function getHelper() {
        return helper;
      },
      getResults: function getResults() {
        var _derivedHelper;
        if (!((_derivedHelper = derivedHelper) !== null && _derivedHelper !== void 0 && _derivedHelper.lastResults)) return null;
        derivedHelper.lastResults._state = helper.state;
        return derivedHelper.lastResults;
      },
      getResultsForWidget: function getResultsForWidget(widget) {
        var _helper;
        if (widget.dependsOn !== "recommend" || isIndexWidget(widget) || widget.$$id === void 0) {
          return this.getResults();
        }
        if (!((_helper = helper) !== null && _helper !== void 0 && _helper.lastRecommendResults)) {
          return null;
        }
        return helper.lastRecommendResults[widget.$$id];
      },
      getPreviousState: function getPreviousState() {
        return lastValidSearchParameters;
      },
      getScopedResults: function getScopedResults() {
        var widgetParent = this.getParent();
        var widgetSiblings;
        if (widgetParent) {
          widgetSiblings = widgetParent.getWidgets();
        } else if (indexName.length === 0) {
          widgetSiblings = this.getWidgets();
        } else {
          widgetSiblings = [this];
        }
        return resolveScopedResultsFromWidgets(widgetSiblings);
      },
      getParent: function getParent() {
        return localParent;
      },
      createURL: function createURL(nextState) {
        if (typeof nextState === "function") {
          return localInstantSearchInstance._createURL(_defineProperty26({}, indexId, nextState(localUiState)));
        }
        return localInstantSearchInstance._createURL(_defineProperty26({}, indexId, getLocalWidgetsUiState(localWidgets, {
          searchParameters: nextState,
          helper
        })));
      },
      getWidgets: function getWidgets() {
        return localWidgets;
      },
      addWidgets: function addWidgets(widgets) {
        var _this = this;
        if (!Array.isArray(widgets)) {
          throw new Error(withUsage7("The `addWidgets` method expects an array of widgets."));
        }
        if (widgets.some(function(widget) {
          return typeof widget.init !== "function" && typeof widget.render !== "function";
        })) {
          throw new Error(withUsage7("The widget definition expects a `render` and/or an `init` method."));
        }
        widgets.forEach(function(widget) {
          if (isIndexWidget(widget)) {
            return;
          }
          if (localInstantSearchInstance && widget.dependsOn === "recommend") {
            localInstantSearchInstance._hasRecommendWidget = true;
          } else if (localInstantSearchInstance) {
            localInstantSearchInstance._hasSearchWidget = true;
          } else if (widget.dependsOn === "recommend") {
            hasRecommendWidget = true;
          } else {
            hasSearchWidget = true;
          }
          addWidgetId(widget);
        });
        localWidgets = localWidgets.concat(widgets);
        if (localInstantSearchInstance && Boolean(widgets.length)) {
          privateHelperSetState(helper, {
            state: getLocalWidgetsSearchParameters(localWidgets, {
              uiState: localUiState,
              initialSearchParameters: helper.state
            }),
            recommendState: getLocalWidgetsRecommendParameters(localWidgets, {
              uiState: localUiState,
              initialRecommendParameters: helper.recommendState
            }),
            _uiState: localUiState
          });
          widgets.forEach(function(widget) {
            if (widget.getRenderState) {
              var renderState = widget.getRenderState(localInstantSearchInstance.renderState[_this.getIndexId()] || {}, createInitArgs(localInstantSearchInstance, _this, localInstantSearchInstance._initialUiState));
              storeRenderState({
                renderState,
                instantSearchInstance: localInstantSearchInstance,
                parent: _this
              });
            }
          });
          widgets.forEach(function(widget) {
            if (widget.init) {
              widget.init(createInitArgs(localInstantSearchInstance, _this, localInstantSearchInstance._initialUiState));
            }
          });
          localInstantSearchInstance.scheduleSearch();
        }
        return this;
      },
      removeWidgets: function removeWidgets(widgets) {
        var _this2 = this;
        if (!Array.isArray(widgets)) {
          throw new Error(withUsage7("The `removeWidgets` method expects an array of widgets."));
        }
        if (widgets.some(function(widget) {
          return typeof widget.dispose !== "function";
        })) {
          throw new Error(withUsage7("The widget definition expects a `dispose` method."));
        }
        localWidgets = localWidgets.filter(function(widget) {
          return widgets.indexOf(widget) === -1;
        });
        localWidgets.forEach(function(widget) {
          if (isIndexWidget(widget)) {
            return;
          }
          if (localInstantSearchInstance && widget.dependsOn === "recommend") {
            localInstantSearchInstance._hasRecommendWidget = true;
          } else if (localInstantSearchInstance) {
            localInstantSearchInstance._hasSearchWidget = true;
          } else if (widget.dependsOn === "recommend") {
            hasRecommendWidget = true;
          } else {
            hasSearchWidget = true;
          }
        });
        if (localInstantSearchInstance && Boolean(widgets.length)) {
          var _widgets$reduce = widgets.reduce(function(states, widget) {
            var next = widget.dispose({
              helper,
              state: states.cleanedSearchState,
              recommendState: states.cleanedRecommendState,
              parent: _this2
            });
            if (next instanceof import_algoliasearch_helper.default.RecommendParameters) {
              states.cleanedRecommendState = next;
            } else if (next) {
              states.cleanedSearchState = next;
            }
            return states;
          }, {
            cleanedSearchState: helper.state,
            cleanedRecommendState: helper.recommendState
          }), cleanedSearchState = _widgets$reduce.cleanedSearchState, cleanedRecommendState = _widgets$reduce.cleanedRecommendState;
          var newState = localInstantSearchInstance.future.preserveSharedStateOnUnmount ? getLocalWidgetsSearchParameters(localWidgets, {
            uiState: localUiState,
            initialSearchParameters: new import_algoliasearch_helper.default.SearchParameters({
              index: this.getIndexName()
            })
          }) : getLocalWidgetsSearchParameters(localWidgets, {
            uiState: getLocalWidgetsUiState(localWidgets, {
              searchParameters: cleanedSearchState,
              helper
            }),
            initialSearchParameters: cleanedSearchState
          });
          localUiState = getLocalWidgetsUiState(localWidgets, {
            searchParameters: newState,
            helper
          });
          helper.setState(newState);
          helper.recommendState = cleanedRecommendState;
          if (localWidgets.length) {
            localInstantSearchInstance.scheduleSearch();
          }
        }
        return this;
      },
      init: function init(_ref2) {
        var _this3 = this, _instantSearchInstanc;
        var instantSearchInstance = _ref2.instantSearchInstance, parent = _ref2.parent, uiState = _ref2.uiState;
        if (helper !== null) {
          return;
        }
        localInstantSearchInstance = instantSearchInstance;
        localParent = parent;
        localUiState = uiState[indexId] || {};
        var mainHelper = instantSearchInstance.mainHelper;
        var parameters = getLocalWidgetsSearchParameters(localWidgets, {
          uiState: localUiState,
          initialSearchParameters: new import_algoliasearch_helper.default.SearchParameters({
            index: indexName
          })
        });
        var recommendParameters = getLocalWidgetsRecommendParameters(localWidgets, {
          uiState: localUiState,
          initialRecommendParameters: new import_algoliasearch_helper.default.RecommendParameters()
        });
        helper = (0, import_algoliasearch_helper.default)({}, parameters.index, parameters);
        helper.recommendState = recommendParameters;
        helper.search = function() {
          if (instantSearchInstance.onStateChange) {
            instantSearchInstance.onStateChange({
              uiState: instantSearchInstance.mainIndex.getWidgetUiState({}),
              setUiState: function setUiState(nextState) {
                return instantSearchInstance.setUiState(nextState, false);
              }
            });
            return mainHelper;
          }
          return mainHelper.search();
        };
        helper.searchWithoutTriggeringOnStateChange = function() {
          return mainHelper.search();
        };
        helper.searchForFacetValues = function(facetName, facetValue, maxFacetHits, userState) {
          var state = helper.state.setQueryParameters(userState);
          return mainHelper.searchForFacetValues(facetName, facetValue, maxFacetHits, state);
        };
        derivedHelper = mainHelper.derive(function() {
          return mergeSearchParameters.apply(void 0, [mainHelper.state].concat(_toConsumableArray5(resolveSearchParameters(_this3))));
        }, function() {
          return _this3.getHelper().recommendState;
        });
        var indexInitialResults = (_instantSearchInstanc = instantSearchInstance._initialResults) === null || _instantSearchInstanc === void 0 ? void 0 : _instantSearchInstanc[this.getIndexId()];
        if (indexInitialResults !== null && indexInitialResults !== void 0 && indexInitialResults.results) {
          var results = new import_algoliasearch_helper.default.SearchResults(new import_algoliasearch_helper.default.SearchParameters(indexInitialResults.state), indexInitialResults.results);
          derivedHelper.lastResults = results;
          helper.lastResults = results;
        }
        if (indexInitialResults !== null && indexInitialResults !== void 0 && indexInitialResults.recommendResults) {
          var recommendResults = new import_algoliasearch_helper.default.RecommendResults(new import_algoliasearch_helper.default.RecommendParameters({
            params: indexInitialResults.recommendResults.params
          }), indexInitialResults.recommendResults.results);
          derivedHelper.lastRecommendResults = recommendResults;
          helper.lastRecommendResults = recommendResults;
        }
        helper.on("change", function(_ref3) {
          var isPageReset = _ref3.isPageReset;
          if (isPageReset) {
            resetPageFromWidgets(localWidgets);
          }
        });
        derivedHelper.on("search", function() {
          instantSearchInstance.scheduleStalledRender();
          if (true) {
            checkIndexUiState({
              index: _this3,
              indexUiState: localUiState
            });
          }
        });
        derivedHelper.on("result", function(_ref4) {
          var results2 = _ref4.results;
          instantSearchInstance.scheduleRender();
          helper.lastResults = results2;
          lastValidSearchParameters = results2 === null || results2 === void 0 ? void 0 : results2._state;
        });
        derivedHelper.on("recommend:result", function(_ref5) {
          var recommend = _ref5.recommend;
          instantSearchInstance.scheduleRender();
          helper.lastRecommendResults = recommend.results;
        });
        localWidgets.forEach(function(widget) {
          if (widget.getRenderState) {
            var renderState = widget.getRenderState(instantSearchInstance.renderState[_this3.getIndexId()] || {}, createInitArgs(instantSearchInstance, _this3, uiState));
            storeRenderState({
              renderState,
              instantSearchInstance,
              parent: _this3
            });
          }
        });
        localWidgets.forEach(function(widget) {
          true ? _warning(
            // if it has NO getWidgetState or if it has getWidgetUiState, we don't warn
            // aka we warn if there's _only_ getWidgetState
            !widget.getWidgetState || Boolean(widget.getWidgetUiState),
            "The `getWidgetState` method is renamed `getWidgetUiState` and will no longer exist under that name in InstantSearch.js 5.x. Please use `getWidgetUiState` instead."
          ) : void 0;
          if (widget.init) {
            widget.init(createInitArgs(instantSearchInstance, _this3, uiState));
          }
        });
        helper.on("change", function(event) {
          var state = event.state;
          var _uiState = event._uiState;
          localUiState = getLocalWidgetsUiState(localWidgets, {
            searchParameters: state,
            helper
          }, _uiState || {});
          if (!instantSearchInstance.onStateChange) {
            instantSearchInstance.onInternalStateChange();
          }
        });
        if (indexInitialResults) {
          instantSearchInstance.scheduleRender();
        }
        if (hasRecommendWidget) {
          instantSearchInstance._hasRecommendWidget = true;
        }
        if (hasSearchWidget) {
          instantSearchInstance._hasSearchWidget = true;
        }
      },
      render: function render(_ref6) {
        var _derivedHelper2, _this4 = this;
        var instantSearchInstance = _ref6.instantSearchInstance;
        if (instantSearchInstance.status === "error" && !instantSearchInstance.mainHelper.hasPendingRequests() && lastValidSearchParameters) {
          helper.setState(lastValidSearchParameters);
        }
        var widgetsToRender = this.getResults() || (_derivedHelper2 = derivedHelper) !== null && _derivedHelper2 !== void 0 && _derivedHelper2.lastRecommendResults ? localWidgets : localWidgets.filter(isIndexWidget);
        widgetsToRender = widgetsToRender.filter(function(widget) {
          if (!widget.shouldRender) {
            return true;
          }
          return widget.shouldRender({
            instantSearchInstance
          });
        });
        widgetsToRender.forEach(function(widget) {
          if (widget.getRenderState) {
            var renderState = widget.getRenderState(instantSearchInstance.renderState[_this4.getIndexId()] || {}, createRenderArgs(instantSearchInstance, _this4, widget));
            storeRenderState({
              renderState,
              instantSearchInstance,
              parent: _this4
            });
          }
        });
        widgetsToRender.forEach(function(widget) {
          if (widget.render) {
            widget.render(createRenderArgs(instantSearchInstance, _this4, widget));
          }
        });
      },
      dispose: function dispose() {
        var _this5 = this, _helper2, _derivedHelper3;
        localWidgets.forEach(function(widget) {
          if (widget.dispose && helper) {
            widget.dispose({
              helper,
              state: helper.state,
              recommendState: helper.recommendState,
              parent: _this5
            });
          }
        });
        localInstantSearchInstance = null;
        localParent = null;
        (_helper2 = helper) === null || _helper2 === void 0 ? void 0 : _helper2.removeAllListeners();
        helper = null;
        (_derivedHelper3 = derivedHelper) === null || _derivedHelper3 === void 0 ? void 0 : _derivedHelper3.detach();
        derivedHelper = null;
      },
      getWidgetUiState: function getWidgetUiState(uiState) {
        return localWidgets.filter(isIndexWidget).reduce(function(previousUiState, innerIndex) {
          return innerIndex.getWidgetUiState(previousUiState);
        }, _objectSpread24(_objectSpread24({}, uiState), {}, _defineProperty26({}, indexId, _objectSpread24(_objectSpread24({}, uiState[indexId]), localUiState))));
      },
      getWidgetState: function getWidgetState(uiState) {
        true ? _warning(false, "The `getWidgetState` method is renamed `getWidgetUiState` and will no longer exist under that name in InstantSearch.js 5.x. Please use `getWidgetUiState` instead.") : void 0;
        return this.getWidgetUiState(uiState);
      },
      getWidgetSearchParameters: function getWidgetSearchParameters(searchParameters, _ref7) {
        var uiState = _ref7.uiState;
        return getLocalWidgetsSearchParameters(localWidgets, {
          uiState,
          initialSearchParameters: searchParameters
        });
      },
      refreshUiState: function refreshUiState() {
        localUiState = getLocalWidgetsUiState(localWidgets, {
          searchParameters: this.getHelper().state,
          helper: this.getHelper()
        }, localUiState);
      },
      setIndexUiState: function setIndexUiState(indexUiState) {
        var nextIndexUiState = typeof indexUiState === "function" ? indexUiState(localUiState) : indexUiState;
        localInstantSearchInstance.setUiState(function(state) {
          return _objectSpread24(_objectSpread24({}, state), {}, _defineProperty26({}, indexId, nextIndexUiState));
        });
      }
    };
  };
  var index_default = index;
  function storeRenderState(_ref8) {
    var renderState = _ref8.renderState, instantSearchInstance = _ref8.instantSearchInstance, parent = _ref8.parent;
    var parentIndexName = parent ? parent.getIndexId() : instantSearchInstance.mainIndex.getIndexId();
    instantSearchInstance.renderState = _objectSpread24(_objectSpread24({}, instantSearchInstance.renderState), {}, _defineProperty26({}, parentIndexName, _objectSpread24(_objectSpread24({}, instantSearchInstance.renderState[parentIndexName]), renderState)));
  }

  // node_modules/instantsearch.js/es/widgets/index.js
  var EXPERIMENTAL_answers = deprecate(answers_default, "answers is no longer supported");
  var EXPERIMENTAL_dynamicWidgets = deprecate(dynamic_widgets_default, "use dynamicWidgets");

  // node_modules/instantsearch.js/es/lib/createHelpers.js
  function _typeof30(obj) {
    "@babel/helpers - typeof";
    return _typeof30 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof30(obj);
  }
  function ownKeys25(object, enumerableOnly) {
    var keys2 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys2.push.apply(keys2, symbols);
    }
    return keys2;
  }
  function _objectSpread25(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys25(Object(source), true).forEach(function(key2) {
        _defineProperty27(target, key2, source[key2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys25(Object(source)).forEach(function(key2) {
        Object.defineProperty(target, key2, Object.getOwnPropertyDescriptor(source, key2));
      });
    }
    return target;
  }
  function _defineProperty27(obj, key2, value) {
    key2 = _toPropertyKey27(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey27(arg) {
    var key2 = _toPrimitive27(arg, "string");
    return _typeof30(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive27(input, hint) {
    if (_typeof30(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof30(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function hoganHelpers(_ref) {
    var numberLocale = _ref.numberLocale;
    return {
      formatNumber: function formatNumber2(value, render) {
        return formatNumber(Number(render(value)), numberLocale);
      },
      highlight: function highlight2(options, render) {
        try {
          var highlightOptions = JSON.parse(options);
          return render(highlight(_objectSpread25(_objectSpread25({}, highlightOptions), {}, {
            hit: this
          })));
        } catch (error) {
          throw new Error('\nThe highlight helper expects a JSON object of the format:\n{ "attribute": "name", "highlightedTagName": "mark" }');
        }
      },
      reverseHighlight: function reverseHighlight2(options, render) {
        try {
          var reverseHighlightOptions = JSON.parse(options);
          return render(reverseHighlight(_objectSpread25(_objectSpread25({}, reverseHighlightOptions), {}, {
            hit: this
          })));
        } catch (error) {
          throw new Error('\n  The reverseHighlight helper expects a JSON object of the format:\n  { "attribute": "name", "highlightedTagName": "mark" }');
        }
      },
      snippet: function snippet2(options, render) {
        try {
          var snippetOptions = JSON.parse(options);
          return render(snippet(_objectSpread25(_objectSpread25({}, snippetOptions), {}, {
            hit: this
          })));
        } catch (error) {
          throw new Error('\nThe snippet helper expects a JSON object of the format:\n{ "attribute": "name", "highlightedTagName": "mark" }');
        }
      },
      reverseSnippet: function reverseSnippet2(options, render) {
        try {
          var reverseSnippetOptions = JSON.parse(options);
          return render(reverseSnippet(_objectSpread25(_objectSpread25({}, reverseSnippetOptions), {}, {
            hit: this
          })));
        } catch (error) {
          throw new Error('\n  The reverseSnippet helper expects a JSON object of the format:\n  { "attribute": "name", "highlightedTagName": "mark" }');
        }
      },
      insights: function insights2(options, render) {
        try {
          var _JSON$parse = JSON.parse(options), method = _JSON$parse.method, payload = _JSON$parse.payload;
          return render(insights(method, _objectSpread25({
            objectIDs: [this.objectID]
          }, payload)));
        } catch (error) {
          throw new Error('\nThe insights helper expects a JSON object of the format:\n{ "method": "method-name", "payload": { "eventName": "name of the event" } }');
        }
      }
    };
  }

  // node_modules/instantsearch.js/es/lib/version.js
  var version_default = "4.71.1";

  // node_modules/instantsearch.js/es/lib/InstantSearch.js
  function _typeof31(obj) {
    "@babel/helpers - typeof";
    return _typeof31 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof31(obj);
  }
  function ownKeys26(object, enumerableOnly) {
    var keys2 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys2.push.apply(keys2, symbols);
    }
    return keys2;
  }
  function _objectSpread26(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys26(Object(source), true).forEach(function(key2) {
        _defineProperty28(target, key2, source[key2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys26(Object(source)).forEach(function(key2) {
        Object.defineProperty(target, key2, Object.getOwnPropertyDescriptor(source, key2));
      });
    }
    return target;
  }
  function _classCallCheck3(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties3(target, props) {
    for (var i2 = 0; i2 < props.length; i2++) {
      var descriptor = props[i2];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey28(descriptor.key), descriptor);
    }
  }
  function _createClass3(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties3(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties3(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", { writable: false });
    return Constructor;
  }
  function _inherits2(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
    Object.defineProperty(subClass, "prototype", { writable: false });
    if (superClass) _setPrototypeOf2(subClass, superClass);
  }
  function _setPrototypeOf2(o2, p2) {
    _setPrototypeOf2 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf3(o3, p3) {
      o3.__proto__ = p3;
      return o3;
    };
    return _setPrototypeOf2(o2, p2);
  }
  function _createSuper2(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct2();
    return function _createSuperInternal() {
      var Super = _getPrototypeOf2(Derived), result;
      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf2(this).constructor;
        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }
      return _possibleConstructorReturn2(this, result);
    };
  }
  function _possibleConstructorReturn2(self2, call) {
    if (call && (_typeof31(call) === "object" || typeof call === "function")) {
      return call;
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
    }
    return _assertThisInitialized2(self2);
  }
  function _assertThisInitialized2(self2) {
    if (self2 === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self2;
  }
  function _isNativeReflectConstruct2() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;
    try {
      Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
      }));
      return true;
    } catch (e2) {
      return false;
    }
  }
  function _getPrototypeOf2(o2) {
    _getPrototypeOf2 = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf3(o3) {
      return o3.__proto__ || Object.getPrototypeOf(o3);
    };
    return _getPrototypeOf2(o2);
  }
  function _defineProperty28(obj, key2, value) {
    key2 = _toPropertyKey28(key2);
    if (key2 in obj) {
      Object.defineProperty(obj, key2, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key2] = value;
    }
    return obj;
  }
  function _toPropertyKey28(arg) {
    var key2 = _toPrimitive28(arg, "string");
    return _typeof31(key2) === "symbol" ? key2 : String(key2);
  }
  function _toPrimitive28(input, hint) {
    if (_typeof31(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof31(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  var withUsage8 = createDocumentationMessageGenerator({
    name: "instantsearch"
  });
  function defaultCreateURL() {
    return "#";
  }
  var INSTANTSEARCH_FUTURE_DEFAULTS = {
    preserveSharedStateOnUnmount: false,
    persistHierarchicalRootCount: false
  };
  var InstantSearch = /* @__PURE__ */ function(_EventEmitter) {
    _inherits2(InstantSearch2, _EventEmitter);
    var _super = _createSuper2(InstantSearch2);
    function InstantSearch2(options) {
      var _options$future2;
      var _this;
      _classCallCheck3(this, InstantSearch2);
      _this = _super.call(this);
      _defineProperty28(_assertThisInitialized2(_this), "client", void 0);
      _defineProperty28(_assertThisInitialized2(_this), "indexName", void 0);
      _defineProperty28(_assertThisInitialized2(_this), "insightsClient", void 0);
      _defineProperty28(_assertThisInitialized2(_this), "onStateChange", null);
      _defineProperty28(_assertThisInitialized2(_this), "future", void 0);
      _defineProperty28(_assertThisInitialized2(_this), "helper", void 0);
      _defineProperty28(_assertThisInitialized2(_this), "mainHelper", void 0);
      _defineProperty28(_assertThisInitialized2(_this), "mainIndex", void 0);
      _defineProperty28(_assertThisInitialized2(_this), "started", void 0);
      _defineProperty28(_assertThisInitialized2(_this), "templatesConfig", void 0);
      _defineProperty28(_assertThisInitialized2(_this), "renderState", {});
      _defineProperty28(_assertThisInitialized2(_this), "_stalledSearchDelay", void 0);
      _defineProperty28(_assertThisInitialized2(_this), "_searchStalledTimer", void 0);
      _defineProperty28(_assertThisInitialized2(_this), "_initialUiState", void 0);
      _defineProperty28(_assertThisInitialized2(_this), "_initialResults", void 0);
      _defineProperty28(_assertThisInitialized2(_this), "_createURL", void 0);
      _defineProperty28(_assertThisInitialized2(_this), "_searchFunction", void 0);
      _defineProperty28(_assertThisInitialized2(_this), "_mainHelperSearch", void 0);
      _defineProperty28(_assertThisInitialized2(_this), "_hasSearchWidget", false);
      _defineProperty28(_assertThisInitialized2(_this), "_hasRecommendWidget", false);
      _defineProperty28(_assertThisInitialized2(_this), "_insights", void 0);
      _defineProperty28(_assertThisInitialized2(_this), "middleware", []);
      _defineProperty28(_assertThisInitialized2(_this), "sendEventToInsights", void 0);
      _defineProperty28(_assertThisInitialized2(_this), "status", "idle");
      _defineProperty28(_assertThisInitialized2(_this), "error", void 0);
      _defineProperty28(_assertThisInitialized2(_this), "scheduleSearch", defer(function() {
        if (_this.started) {
          _this.mainHelper.search();
        }
      }));
      _defineProperty28(_assertThisInitialized2(_this), "scheduleRender", defer(function() {
        var _this$mainHelper;
        var shouldResetStatus = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : true;
        if (!((_this$mainHelper = _this.mainHelper) !== null && _this$mainHelper !== void 0 && _this$mainHelper.hasPendingRequests())) {
          clearTimeout(_this._searchStalledTimer);
          _this._searchStalledTimer = null;
          if (shouldResetStatus) {
            _this.status = "idle";
            _this.error = void 0;
          }
        }
        _this.mainIndex.render({
          instantSearchInstance: _assertThisInitialized2(_this)
        });
        _this.emit("render");
      }));
      _defineProperty28(_assertThisInitialized2(_this), "onInternalStateChange", defer(function() {
        var nextUiState = _this.mainIndex.getWidgetUiState({});
        _this.middleware.forEach(function(_ref) {
          var instance = _ref.instance;
          instance.onStateChange({
            uiState: nextUiState
          });
        });
      }));
      _this.setMaxListeners(100);
      var _options$indexName = options.indexName, indexName = _options$indexName === void 0 ? "" : _options$indexName, numberLocale = options.numberLocale, _options$initialUiSta = options.initialUiState, initialUiState = _options$initialUiSta === void 0 ? {} : _options$initialUiSta, _options$routing = options.routing, routing = _options$routing === void 0 ? null : _options$routing, _options$insights = options.insights, insights2 = _options$insights === void 0 ? void 0 : _options$insights, searchFunction = options.searchFunction, _options$stalledSearc = options.stalledSearchDelay, stalledSearchDelay = _options$stalledSearc === void 0 ? 200 : _options$stalledSearc, _options$searchClient = options.searchClient, searchClient2 = _options$searchClient === void 0 ? null : _options$searchClient, _options$insightsClie = options.insightsClient, insightsClient = _options$insightsClie === void 0 ? null : _options$insightsClie, _options$onStateChang = options.onStateChange, onStateChange = _options$onStateChang === void 0 ? null : _options$onStateChang, _options$future = options.future, future = _options$future === void 0 ? _objectSpread26(_objectSpread26({}, INSTANTSEARCH_FUTURE_DEFAULTS), options.future || {}) : _options$future;
      if (searchClient2 === null) {
        throw new Error(withUsage8("The `searchClient` option is required."));
      }
      if (typeof searchClient2.search !== "function") {
        throw new Error("The `searchClient` must implement a `search` method.\n\nSee: https://www.algolia.com/doc/guides/building-search-ui/going-further/backend-search/in-depth/backend-instantsearch/js/");
      }
      if (typeof searchClient2.addAlgoliaAgent === "function") {
        searchClient2.addAlgoliaAgent("instantsearch.js (".concat(version_default, ")"));
      }
      true ? _warning(insightsClient === null, "`insightsClient` property has been deprecated. It is still supported in 4.x releases, but not further. It is replaced by the `insights` middleware.\n\nFor more information, visit https://www.algolia.com/doc/guides/getting-insights-and-analytics/search-analytics/click-through-and-conversions/how-to/send-click-and-conversion-events-with-instantsearch/js/") : void 0;
      if (insightsClient && typeof insightsClient !== "function") {
        throw new Error(withUsage8("The `insightsClient` option should be a function."));
      }
      true ? _warning(!options.searchParameters, "The `searchParameters` option is deprecated and will not be supported in InstantSearch.js 4.x.\n\nYou can replace it with the `configure` widget:\n\n```\nsearch.addWidgets([\n  configure(".concat(JSON.stringify(options.searchParameters, null, 2), ")\n]);\n```\n\nSee ").concat(createDocumentationLink({
        name: "configure"
      }))) : void 0;
      if (((_options$future2 = options.future) === null || _options$future2 === void 0 ? void 0 : _options$future2.preserveSharedStateOnUnmount) === void 0) {
        console.info("Starting from the next major version, InstantSearch will change how widgets state is preserved when they are removed. InstantSearch will keep the state of unmounted widgets to be usable by other widgets with the same attribute.\n\nWe recommend setting `future.preserveSharedStateOnUnmount` to true to adopt this change today.\nTo stay with the current behaviour and remove this warning, set the option to false.\n\nSee documentation: ".concat(createDocumentationLink({
          name: "instantsearch"
        }), "#widget-param-future\n          "));
      }
      _this.client = searchClient2;
      _this.future = future;
      _this.insightsClient = insightsClient;
      _this.indexName = indexName;
      _this.helper = null;
      _this.mainHelper = null;
      _this.mainIndex = index_default({
        indexName
      });
      _this.onStateChange = onStateChange;
      _this.started = false;
      _this.templatesConfig = {
        helpers: hoganHelpers({
          numberLocale
        }),
        compileOptions: {}
      };
      _this._stalledSearchDelay = stalledSearchDelay;
      _this._searchStalledTimer = null;
      _this._createURL = defaultCreateURL;
      _this._initialUiState = initialUiState;
      _this._initialResults = null;
      _this._insights = insights2;
      if (searchFunction) {
        true ? _warning(false, "The `searchFunction` option is deprecated. Use `onStateChange` instead.") : void 0;
        _this._searchFunction = searchFunction;
      }
      _this.sendEventToInsights = noop;
      if (routing) {
        var routerOptions = typeof routing === "boolean" ? {} : routing;
        routerOptions.$$internal = true;
        _this.use(createRouterMiddleware(routerOptions));
      }
      if (insights2) {
        var insightsOptions = typeof insights2 === "boolean" ? {} : insights2;
        insightsOptions.$$internal = true;
        _this.use(createInsightsMiddleware(insightsOptions));
      }
      if (isMetadataEnabled()) {
        _this.use(createMetadataMiddleware({
          $$internal: true
        }));
      }
      return _this;
    }
    _createClass3(InstantSearch2, [{
      key: "_isSearchStalled",
      get: (
        /**
         * @deprecated use `status === 'stalled'` instead
         */
        function get3() {
          true ? _warning(false, '`InstantSearch._isSearchStalled` is deprecated and will be removed in InstantSearch.js 5.0.\n\nUse `InstantSearch.status === "stalled"` instead.') : void 0;
          return this.status === "stalled";
        }
      )
    }, {
      key: "use",
      value: function use() {
        var _this2 = this;
        for (var _len = arguments.length, middleware = new Array(_len), _key = 0; _key < _len; _key++) {
          middleware[_key] = arguments[_key];
        }
        var newMiddlewareList = middleware.map(function(fn) {
          var newMiddleware = _objectSpread26({
            $$type: "__unknown__",
            $$internal: false,
            subscribe: noop,
            started: noop,
            unsubscribe: noop,
            onStateChange: noop
          }, fn({
            instantSearchInstance: _this2
          }));
          _this2.middleware.push({
            creator: fn,
            instance: newMiddleware
          });
          return newMiddleware;
        });
        if (this.started) {
          newMiddlewareList.forEach(function(m3) {
            m3.subscribe();
            m3.started();
          });
        }
        return this;
      }
      /**
       * Removes a middleware from the InstantSearch lifecycle.
       */
    }, {
      key: "unuse",
      value: function unuse() {
        for (var _len2 = arguments.length, middlewareToUnuse = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          middlewareToUnuse[_key2] = arguments[_key2];
        }
        this.middleware.filter(function(m3) {
          return middlewareToUnuse.includes(m3.creator);
        }).forEach(function(m3) {
          return m3.instance.unsubscribe();
        });
        this.middleware = this.middleware.filter(function(m3) {
          return !middlewareToUnuse.includes(m3.creator);
        });
        return this;
      }
      // @major we shipped with EXPERIMENTAL_use, but have changed that to just `use` now
    }, {
      key: "EXPERIMENTAL_use",
      value: function EXPERIMENTAL_use() {
        true ? _warning(false, "The middleware API is now considered stable, so we recommend replacing `EXPERIMENTAL_use` with `use` before upgrading to the next major version.") : void 0;
        return this.use.apply(this, arguments);
      }
      /**
       * Adds a widget to the search instance.
       * A widget can be added either before or after InstantSearch has started.
       * @param widget The widget to add to InstantSearch.
       *
       * @deprecated This method will still be supported in 4.x releases, but not further. It is replaced by `addWidgets([widget])`.
       */
    }, {
      key: "addWidget",
      value: function addWidget(widget) {
        true ? _warning(false, "addWidget will still be supported in 4.x releases, but not further. It is replaced by `addWidgets([widget])`") : void 0;
        return this.addWidgets([widget]);
      }
      /**
       * Adds multiple widgets to the search instance.
       * Widgets can be added either before or after InstantSearch has started.
       * @param widgets The array of widgets to add to InstantSearch.
       */
    }, {
      key: "addWidgets",
      value: function addWidgets(widgets) {
        if (!Array.isArray(widgets)) {
          throw new Error(withUsage8("The `addWidgets` method expects an array of widgets. Please use `addWidget`."));
        }
        if (widgets.some(function(widget) {
          return typeof widget.init !== "function" && typeof widget.render !== "function";
        })) {
          throw new Error(withUsage8("The widget definition expects a `render` and/or an `init` method."));
        }
        this.mainIndex.addWidgets(widgets);
        return this;
      }
      /**
       * Removes a widget from the search instance.
       * @deprecated This method will still be supported in 4.x releases, but not further. It is replaced by `removeWidgets([widget])`
       * @param widget The widget instance to remove from InstantSearch.
       *
       * The widget must implement a `dispose()` method to clear its state.
       */
    }, {
      key: "removeWidget",
      value: function removeWidget(widget) {
        true ? _warning(false, "removeWidget will still be supported in 4.x releases, but not further. It is replaced by `removeWidgets([widget])`") : void 0;
        return this.removeWidgets([widget]);
      }
      /**
       * Removes multiple widgets from the search instance.
       * @param widgets Array of widgets instances to remove from InstantSearch.
       *
       * The widgets must implement a `dispose()` method to clear their states.
       */
    }, {
      key: "removeWidgets",
      value: function removeWidgets(widgets) {
        if (!Array.isArray(widgets)) {
          throw new Error(withUsage8("The `removeWidgets` method expects an array of widgets. Please use `removeWidget`."));
        }
        if (widgets.some(function(widget) {
          return typeof widget.dispose !== "function";
        })) {
          throw new Error(withUsage8("The widget definition expects a `dispose` method."));
        }
        this.mainIndex.removeWidgets(widgets);
        return this;
      }
      /**
       * Ends the initialization of InstantSearch.js and triggers the
       * first search.
       */
    }, {
      key: "start",
      value: function start() {
        var _this3 = this;
        if (this.started) {
          throw new Error(withUsage8("The `start` method has already been called once."));
        }
        var mainHelper = this.mainHelper || (0, import_algoliasearch_helper2.default)(this.client, this.indexName, void 0, {
          persistHierarchicalRootCount: this.future.persistHierarchicalRootCount
        });
        mainHelper.search = function() {
          _this3.status = "loading";
          _this3.scheduleRender(false);
          true ? _warning(Boolean(_this3.indexName) || _this3.mainIndex.getWidgets().some(isIndexWidget), "No indexName provided, nor an explicit index widget in the widgets tree. This is required to be able to display results.") : void 0;
          if (_this3._hasSearchWidget) {
            mainHelper.searchOnlyWithDerivedHelpers();
          }
          if (_this3._hasRecommendWidget) {
            mainHelper.recommend();
          }
          return mainHelper;
        };
        if (this._searchFunction) {
          var fakeClient = {
            search: function search2() {
              return new Promise(noop);
            }
          };
          this._mainHelperSearch = mainHelper.search.bind(mainHelper);
          mainHelper.search = function() {
            var mainIndexHelper = _this3.mainIndex.getHelper();
            var searchFunctionHelper = (0, import_algoliasearch_helper2.default)(fakeClient, mainIndexHelper.state.index, mainIndexHelper.state);
            searchFunctionHelper.once("search", function(_ref2) {
              var state = _ref2.state;
              mainIndexHelper.overrideStateWithoutTriggeringChangeEvent(state);
              _this3._mainHelperSearch();
            });
            searchFunctionHelper.on("change", function(_ref3) {
              var state = _ref3.state;
              mainIndexHelper.setState(state);
            });
            _this3._searchFunction(searchFunctionHelper);
            return mainHelper;
          };
        }
        mainHelper.on("error", function(_ref4) {
          var error = _ref4.error;
          if (!(error instanceof Error)) {
            var err = error;
            error = Object.keys(err).reduce(function(acc, key2) {
              acc[key2] = err[key2];
              return acc;
            }, new Error(err.message));
          }
          error.error = error;
          _this3.error = error;
          _this3.status = "error";
          _this3.scheduleRender(false);
          _this3.emit("error", error);
        });
        this.mainHelper = mainHelper;
        this.middleware.forEach(function(_ref5) {
          var instance = _ref5.instance;
          instance.subscribe();
        });
        this.mainIndex.init({
          instantSearchInstance: this,
          parent: null,
          uiState: this._initialUiState
        });
        if (this._initialResults) {
          hydrateSearchClient(this.client, this._initialResults);
          hydrateRecommendCache(this.mainHelper, this._initialResults);
          var originalScheduleSearch = this.scheduleSearch;
          this.scheduleSearch = defer(noop);
          defer(function() {
            _this3.scheduleSearch = originalScheduleSearch;
          })();
        } else if (this.mainIndex.getWidgets().length > 0) {
          this.scheduleSearch();
        }
        this.helper = this.mainIndex.getHelper();
        this.started = true;
        this.middleware.forEach(function(_ref6) {
          var instance = _ref6.instance;
          instance.started();
        });
        if (typeof this._insights === "undefined") {
          mainHelper.derivedHelpers[0].once("result", function() {
            var hasAutomaticInsights = _this3.mainIndex.getScopedResults().some(function(_ref7) {
              var results = _ref7.results;
              return results === null || results === void 0 ? void 0 : results._automaticInsights;
            });
            if (hasAutomaticInsights) {
              _this3.use(createInsightsMiddleware({
                $$internal: true,
                $$automatic: true
              }));
            }
          });
        }
      }
      /**
       * Removes all widgets without triggering a search afterwards.
       * @return {undefined} This method does not return anything
       */
    }, {
      key: "dispose",
      value: function dispose() {
        var _this$mainHelper2;
        this.scheduleSearch.cancel();
        this.scheduleRender.cancel();
        clearTimeout(this._searchStalledTimer);
        this.removeWidgets(this.mainIndex.getWidgets());
        this.mainIndex.dispose();
        this.started = false;
        this.removeAllListeners();
        (_this$mainHelper2 = this.mainHelper) === null || _this$mainHelper2 === void 0 ? void 0 : _this$mainHelper2.removeAllListeners();
        this.mainHelper = null;
        this.helper = null;
        this.middleware.forEach(function(_ref8) {
          var instance = _ref8.instance;
          instance.unsubscribe();
        });
      }
    }, {
      key: "scheduleStalledRender",
      value: function scheduleStalledRender() {
        var _this4 = this;
        if (!this._searchStalledTimer) {
          this._searchStalledTimer = setTimeout(function() {
            _this4.status = "stalled";
            _this4.scheduleRender();
          }, this._stalledSearchDelay);
        }
      }
      /**
       * Set the UI state and trigger a search.
       * @param uiState The next UI state or a function computing it from the current state
       * @param callOnStateChange private parameter used to know if the method is called from a state change
       */
    }, {
      key: "setUiState",
      value: function setUiState(uiState) {
        var _this5 = this;
        var callOnStateChange = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
        if (!this.mainHelper) {
          throw new Error(withUsage8("The `start` method needs to be called before `setUiState`."));
        }
        this.mainIndex.refreshUiState();
        var nextUiState = typeof uiState === "function" ? uiState(this.mainIndex.getWidgetUiState({})) : uiState;
        if (this.onStateChange && callOnStateChange) {
          this.onStateChange({
            uiState: nextUiState,
            setUiState: function setUiState2(finalUiState) {
              setIndexHelperState(typeof finalUiState === "function" ? finalUiState(nextUiState) : finalUiState, _this5.mainIndex);
              _this5.scheduleSearch();
              _this5.onInternalStateChange();
            }
          });
        } else {
          setIndexHelperState(nextUiState, this.mainIndex);
          this.scheduleSearch();
          this.onInternalStateChange();
        }
      }
    }, {
      key: "getUiState",
      value: function getUiState() {
        if (this.started) {
          this.mainIndex.refreshUiState();
        }
        return this.mainIndex.getWidgetUiState({});
      }
    }, {
      key: "createURL",
      value: function createURL() {
        var nextState = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        if (!this.started) {
          throw new Error(withUsage8("The `start` method needs to be called before `createURL`."));
        }
        return this._createURL(nextState);
      }
    }, {
      key: "refresh",
      value: function refresh() {
        if (!this.mainHelper) {
          throw new Error(withUsage8("The `start` method needs to be called before `refresh`."));
        }
        this.mainHelper.clearCache().search();
      }
    }]);
    return InstantSearch2;
  }(import_events.default);
  var InstantSearch_default = InstantSearch;

  // node_modules/instantsearch.js/es/index.js
  var instantsearch = function instantsearch2(options) {
    return new InstantSearch_default(options);
  };
  instantsearch.version = version_default;
  instantsearch.createInfiniteHitsSessionStorageCache = deprecate(createInfiniteHitsSessionStorageCache, "import { createInfiniteHitsSessionStorageCache } from 'instantsearch.js/es/lib/infiniteHitsCache'");
  instantsearch.highlight = deprecate(highlight, "import { highlight } from 'instantsearch.js/es/helpers'");
  instantsearch.reverseHighlight = deprecate(reverseHighlight, "import { reverseHighlight } from 'instantsearch.js/es/helpers'");
  instantsearch.snippet = deprecate(snippet, "import { snippet } from 'instantsearch.js/es/helpers'");
  instantsearch.reverseSnippet = deprecate(reverseSnippet, "import { reverseSnippet } from 'instantsearch.js/es/helpers'");
  instantsearch.insights = insights;
  instantsearch.getInsightsAnonymousUserToken = getInsightsAnonymousUserToken;
  Object.defineProperty(instantsearch, "widgets", {
    get: function get() {
      throw new ReferenceError(`"instantsearch.widgets" are not available from the ES build.

To import the widgets:

import { searchBox } from 'instantsearch.js/es/widgets'`);
    }
  });
  Object.defineProperty(instantsearch, "connectors", {
    get: function get2() {
      throw new ReferenceError(`"instantsearch.connectors" are not available from the ES build.

To import the connectors:

import { connectSearchBox } from 'instantsearch.js/es/connectors'`);
    }
  });
  var es_default = instantsearch;

  // <stdin>
  var searchClient = (0, import_lite.default)("latency", "blablabla");
  var search = es_default({
    indexName: "fx_hackathon_24_bm_products",
    searchClient,
    insights: true
  });
  search.addWidgets([
    hits_default({ container: "#hits" })
  ]);
  search.start();
})();
/*! Bundled license information:

algoliasearch/dist/algoliasearch-lite.umd.js:
  (*! algoliasearch-lite.umd.js | 4.23.2 | © Algolia, inc. | https://github.com/algolia/algoliasearch-client-javascript *)
*/
