require('should');
const nock = require('nock');

const zapier = require('zapier-platform-core');

// Use this to make test calls into your app:
const App = require('../../index');
const appTester = zapier.createAppTester(App);

describe('Creates', function () {
    describe('Update Member', function () {
        let apiMock, authData;

        beforeEach(function () {
            apiMock = nock('http://zapier-test.ghost.io', {
                reqheaders: {
                    'User-Agent': new RegExp(`Zapier/${App.version} GhostAdminSDK/\\d+.\\d+.\\d+`)
                }
            });
            authData = {
                adminApiUrl: 'http://zapier-test.ghost.io',
                adminApiKey: '5c3e1182e79eace7f58c9c3b:7202e874ccae6f1ee6688bb700f356b672fb078d8465860852652037f7c7459ddbd2f2a6e9aa05a40b499ae20027d9f9ba2e5004aa9ab6510b90a5dac674cbc1'
            };
        });

        afterEach(function () {
            nock.cleanAll();
        });

        describe('with supported version', function () {
            beforeEach(function () {
                apiMock.get('/ghost/api/v2/admin/site/').reply(200, {
                    site: {version: '3.0'}
                });
            });

            it('updates a member', function () {
                let bundle = Object.assign({}, {authData}, {
                    inputData: {
                        id: '5c9c9c8d51b5bf974afad2a4',
                        name: 'Test Member',
                        email: 'test@example.com',
                        send_email: 'no',
                        email_type: 'signup'
                    }
                });

                apiMock.put('/ghost/api/v3/admin/members/5c9c9c8d51b5bf974afad2a4/', {
                    members: [{
                        name: 'Test Member',
                        email: 'test@example.com'
                    }]
                }).reply(200, {
                    members: [{
                        id: '5c9c9c8d51b5bf974afad2a4',
                        name: 'Test Member',
                        email: 'test@example.com',
                        created_at: '2019-10-03T11:54:10.123Z',
                        updated_at: '2019-10-03T11:54:10.123Z'
                    }]
                });

                return appTester(App.creates.update_member.operation.perform, bundle)
                    .then((member) => {
                        apiMock.isDone().should.be.true;

                        member.id.should.equal('5c9c9c8d51b5bf974afad2a4');
                        member.name.should.equal('Test Member');
                        member.email.should.equal('test@example.com');
                    });
            });

            it('has a friendly, halting validation error', function () {
                let bundle = Object.assign({}, {authData}, {
                    inputData: {
                        id: '5c9c9c8d51b5bf974afad2a4',
                        email: 'not_valid'
                    }
                });

                apiMock.put('/ghost/api/v3/admin/members/5c9c9c8d51b5bf974afad2a4/', {
                    members: [{
                        email: 'not_valid'
                    }]
                }).reply(422, {
                    errors: [{
                        message: 'Validation error, cannot save subscriber.',
                        context: 'Validation (isEmail) failed for email',
                        type: 'ValidationError',
                        details: null,
                        property: null,
                        help: null,
                        code: null,
                        id: '2749ebe0-5145-11e9-9864-f79cf99013d0'
                    }]
                });

                return appTester(App.creates.update_member.operation.perform, bundle)
                    .then(() => {
                        true.should.equal(false);
                    }, (err) => {
                        err.name.should.eql('HaltedError');
                        err.message.should.match(/Validation \(isEmail\) failed for email/);
                    });
            });

            it('handles 500 errors with JSON error body', function () {
                let bundle = Object.assign({}, {authData}, {
                    inputData: {
                        id: '5c9c9c8d51b5bf974afad2a4',
                        name: 'Test Member',
                        email: 'test@example.com'
                    }
                });

                apiMock.put('/ghost/api/v3/admin/members/5c9c9c8d51b5bf974afad2a4/')
                    .reply(500, {
                        errors: [{
                            message: 'Authorization failed',
                            context: 'Unable to determine the authenticated user or integration. Check that cookies are being passed through if using session authentication.',
                            type: 'NoPermissionError',
                            details: null,
                            property: null,
                            help: null,
                            code: null,
                            id: '34950f70-5148-11e9-9864-f79cf99013d0'
                        }]
                    });

                return appTester(App.creates.update_member.operation.perform, bundle)
                    .then(() => {
                        true.should.eql(false);
                    }, (err) => {
                        err.name.should.eql('RequestError');
                        err.message.should.match(/Authorization failed/);
                    });
            });
        });

        describe('with supported version >=3.6', function () {
            beforeEach(function () {
                apiMock.get('/ghost/api/v2/admin/site/').reply(200, {
                    site: {version: '3.6'}
                });
            });

            it('updates member label', function () {
                apiMock.get('/ghost/api/v2/admin/site/').reply(200, {
                    site: {version: '3.6'}
                });
                let bundle = Object.assign({}, {authData}, {
                    inputData: {
                        id: '5c9c9c8d51b5bf974afad2a4',
                        labels: ['Zapier']
                    }
                });

                apiMock.put('/ghost/api/v3/admin/members/5c9c9c8d51b5bf974afad2a4/', {
                    members: [{
                        labels: ['Zapier']
                    }]
                }).reply(200, {
                    members: [{
                        id: '5c9c9c8d51b5bf974afad2a4',
                        name: 'Test Member',
                        email: 'test@example.com',
                        labels: [
                            {
                                id: '5e425659230484605f002c57',
                                name: 'Zapier',
                                created_at: '2020-02-11T07:23:05.520Z',
                                updated_at: '2020-02-11T07:23:05.520Z',
                                slug: 'zapier'
                            }
                        ],
                        created_at: '2019-10-03T11:54:10.123Z',
                        updated_at: '2019-10-03T11:54:10.123Z'
                    }]
                });

                return appTester(App.creates.update_member.operation.perform, bundle)
                    .then((member) => {
                        apiMock.isDone().should.be.true;

                        member.id.should.equal('5c9c9c8d51b5bf974afad2a4');
                        member.name.should.equal('Test Member');
                        member.email.should.equal('test@example.com');
                        member.labels.should.have.lengthOf(1);
                    });
            });
        });

        describe('with supported version >=3.36', function () {
            beforeEach(function () {
                apiMock.get('/ghost/api/v2/admin/site/').reply(200, {
                    site: {version: '3.36'}
                });
            });

            it('updates member comped flag', function () {
                apiMock.get('/ghost/api/v2/admin/site/').reply(200, {
                    site: {version: '3.36'}
                });
                let bundle = Object.assign({}, {authData}, {
                    inputData: {
                        id: '5c9c9c8d51b5bf974afad2a4',
                        comped: true
                    }
                });

                apiMock.put('/ghost/api/v3/admin/members/5c9c9c8d51b5bf974afad2a4/', {
                    members: [{
                        comped: true
                    }]
                }).reply(201, {
                    members: [{
                        id: '5c9c9c8d51b5bf974afad2a4',
                        name: 'Test Member',
                        email: 'test@example.com',
                        comped: true,
                        labels: [],
                        created_at: '2019-10-03T11:54:10.123Z',
                        updated_at: '2019-10-03T11:54:10.123Z'
                    }]
                });

                return appTester(App.creates.update_member.operation.perform, bundle)
                    .then((member) => {
                        apiMock.isDone().should.be.true;

                        member.id.should.equal('5c9c9c8d51b5bf974afad2a4');
                        member.name.should.equal('Test Member');
                        member.email.should.equal('test@example.com');
                        member.comped.should.equal(true);
                    });
            });
        });

        describe('with unsupported version', function () {
            beforeEach(function () {
                apiMock.get('/ghost/api/v2/admin/site/').reply(200, {
                    site: {version: '2.34'}
                });
            });

            it('has a friendly, halting "unsupported version" error', function () {
                let bundle = Object.assign({}, {authData}, {
                    inputData: {
                        name: 'Test Member',
                        email: 'test@example.com'
                    }
                });

                return appTester(App.creates.update_member.operation.perform, bundle)
                    .then(() => {
                        true.should.equal(false);
                    }, (err) => {
                        err.name.should.eql('HaltedError');
                        err.message.should.match(/2\.34/);
                    });
            });
        });

        describe('with unsupported version <= 3.6', function () {
            beforeEach(function () {
                apiMock.get('/ghost/api/v2/admin/site/').reply(200, {
                    site: {version: '3.0'}
                });
            });

            it('has a friendly, halting "unsupported version" error for labels', function () {
                let bundle = Object.assign({}, {authData}, {
                    inputData: {
                        name: 'Test Member',
                        email: 'test@example.com',
                        labels: ['Zapier']
                    }
                });

                return appTester(App.creates.update_member.operation.perform, bundle)
                    .then(() => {
                        true.should.equal(false);
                    }, (err) => {
                        err.name.should.eql('HaltedError');
                        err.message.should.match(/3\.0/);
                    });
            });

            it('has a friendly, halting "unsupported version" error for comped flag', function () {
                let bundle = Object.assign({}, {authData}, {
                    inputData: {
                        name: 'Test Member',
                        email: 'test@example.com',
                        comped: true
                    }
                });

                return appTester(App.creates.update_member.operation.perform, bundle)
                    .then(() => {
                        true.should.equal(false);
                    }, (err) => {
                        err.name.should.eql('HaltedError');
                        err.message.should.match(/3\.0/);
                    });
            });
        });
    });
});
