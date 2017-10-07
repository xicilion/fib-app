const test = require('test');
test.setup();

const http = require('http');

describe("acl", () => {
    it("forbidden", () => {
        var rep = http.post('http://127.0.0.1:8080/1.0/classes/test_acl', {
            json: {
                name: "aaa"
            }
        });
        assert.equal(rep.statusCode, 119);
    });

    it("role allow all", () => {
        var rep = http.post('http://127.0.0.1:8080/set_session', {
            json: {
                id: 12345,
                roles: ['r1']
            }
        });

        var rep = http.post('http://127.0.0.1:8080/1.0/classes/test_acl', {
            json: {
                name: "aaa"
            }
        });
        assert.equal(rep.statusCode, 201);
    });

    it("role allow act", () => {
        var rep = http.post('http://127.0.0.1:8080/set_session', {
            json: {
                id: 12345,
                roles: ['r2']
            }
        });

        var rep = http.post('http://127.0.0.1:8080/1.0/classes/test_acl', {
            json: {
                name: "aaa"
            }
        });
        assert.equal(rep.statusCode, 201);
    });

    it("user disallow", () => {
        var rep = http.post('http://127.0.0.1:8080/set_session', {
            json: {
                id: 9999,
                roles: ['r1']
            }
        });

        var rep = http.post('http://127.0.0.1:8080/1.0/classes/test_acl', {
            json: {
                name: "aaa"
            }
        });
        assert.equal(rep.statusCode, 119);
    });
});