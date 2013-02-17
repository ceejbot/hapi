// Load modules

var Chai = require('chai');
var Hapi = require('../helpers');
var Views = require('../../lib/views');


// Declare internals

var internals = {};


// Test shortcuts

var expect = Chai.expect;


describe('Views', function () {

    var viewsPath = __dirname + '/templates';

    describe('#render', function () {

        var testView = new Views({
            path: viewsPath,
            layout: false
        });

        var testViewWithLayouts = new Views({
            path: viewsPath,
            layout: true
        });

        it('should handle omitting the options parameter', function (done) {

            testView.render('valid/novars', {}, function (html) {
                expect(html).to.exist;
                expect(typeof html).equal('string');
                done();
            });

        });

        it('should handle omitting both context & options parameters', function (done) {

            testView.render('valid/novars', function (html) {
                expect(html).to.exist;
                expect(typeof html).equal('string');
                done();
            });

        });

        it('should work and not throw with valid (no layouts)', function (done) {

            var fn = (function () {
                testView.render('valid/test', { title: 'test', message: 'Hapi' }, function (html) {
                    expect(html).to.exist;
                    expect(html.length).above(1);
                });
            });

            expect(fn).to.not.throw();
            done();
        });

        it('should work and not throw with valid (with layouts)', function (done) {

            var fn = (function () {
                testViewWithLayouts.render('valid/test', { title: 'test', message: 'Hapi' }, function (html) {
                    expect(html).to.exist;
                    expect(html.length).above(1);
                });
            });

            expect(fn).to.not.throw();
            done();
        });

        it('should respond with an error when referencing a non-existent layout', function (done) {

            var missingLayoutView = new Views({
                path: viewsPath,
                layout: true,
                layoutFile: 'invalid/missing'
            });

            missingLayoutView.render('valid/test', { title: 'test', message: 'Hapi' }, function (result) {
                expect(result).to.exist;
                expect(typeof result).equal('object');
                expect(result.hasOwnProperty('isBoom')).equal(true);
                expect(result.isBoom).equal(true);
                done();
            });
        });

        it('should throw when referencing non-existent partial (with layouts)', function (done) {

            var fn = (function () {
                testViewWithLayouts.render('invalid/test', { title: 'test', message: 'Hapi' }, function (html) {
                    expect(html).to.exist;
                    expect(html.length).above(1);
                });
            });

            expect(fn).to.throw();
            done();
        });

        it('should throw when referencing non existant partial (no layouts)', function (done) {

            var fn = (function () {
                testView.render('invalid/test', { title: 'test', message: 'Hapi' }, function (html) {
                    expect(html).to.exist;
                    expect(html.length).above(1);
                });
            });

            expect(fn).to.throw();
            done();
        });

        it('should throw if context uses layoutKeyword as a key', function (done) {

            var fn = (function () {
                var opts = { title: 'test', message: 'Hapi' };
                opts[testView.options.layoutKeyword] = 1;
                testViewWithLayouts.render('valid/test', opts, function (html) {
                    // no-op
                });
            });

            expect(fn).to.throw();
            done();
        });

        it('should call back with error on compile error (invalid template code)', function (done) {

            testView.render('invalid/badmustache', { title: 'test', message: 'Hapi' }, function (error) {
                expect(error instanceof Error).to.equal(true);
                done();
            });
        });

        it('should load partials and be able to render them', function (done) {

            var fn = (function () {

                var tempView = new Views({
                    path: viewsPath + '/valid',
                    partials: {
                        path: viewsPath + '/valid/partials'
                    }
                });

                tempView.render('testPartials', {}, function (html) {
                    expect(html).to.exist;
                    expect(html.length).above(1);
                });
            });

            expect(fn).to.not.throw();
            done();
        });

        it('should load partials and render them EVEN if viewsPath has trailing slash', function (done) {

            var fn = (function () {

                var tempView = new Views({
                    path: viewsPath + '/valid',
                    partials: {
                        path: viewsPath + '/valid/partials/'
                    }
                });

                tempView.render('testPartials', {}, function (html) {
                    expect(html).to.exist;
                    expect(html.length).above(1);
                });
            });

            expect(fn).to.not.throw();
            done();
        });

        it('returns an error when given a non-string template name', function (done) {

            testView.render(function () { return 'foo'; }, { title: 'test', message: 'Hapi' }, function (result) {

                expect(result).to.exist;
                expect(typeof result).equal('object');
                expect(result.hasOwnProperty('isBoom')).equal(true);
                expect(result.isBoom).equal(true);
                done();
            });

        });

        it('should skip loading partial if engine does not have registerPartial method', function (done) {

            var fn = (function () {

                var tempView = new Views({
                    path: viewsPath + '/valid',
                    partials: {
                        path: viewsPath + '/valid/partials'
                    },
                    engines: {
                        'html': { module: 'jade' }
                    }
                });

                tempView.render('testPartials', {}, function (html) {
                    expect(html).to.exist;
                    expect(html.length).above(1);
                });
            });

            expect(fn).to.not.throw();
            done();
        });
    });

    describe('#renderAsync', function () {

        var asyncView = new Views({
            path: viewsPath,
            layout: false,
            engines: {
                'blade': {
                    module: 'blade',
                    extension: 'blade'
                }
            },
            asyncCompile: true,
            asyncRender: true,
            cache: false
        });

        var asyncViewWithLayouts = new Views({
            path: viewsPath,
            layout: true,
            layoutKeyword: 'content',
            layoutFile: 'blade/layout.blade',
            engines: {
                'blade': {
                    module: 'blade',
                    extension: 'blade'
                }
            },
            asyncCompile: true,
            asyncRender: true,
            cache: false
        });

        it('can render a valid template without a layout', function (done) {

            asyncView.render('blade/valid', { title: 'test', message: 'Hapi' }, function (result) {
                expect(result).to.exist;
                expect(typeof result).equal('string');
                expect(result.length).above(1);
                expect(result.indexOf('<title>test</title>')).above(-1);
                done();
            });
        });

        it('can render a valid template with a layout', function (done) {

            asyncViewWithLayouts.render('blade/content', { title: 'test', message: 'Hapi' }, function (result) {
                expect(result).to.exist;
                expect(typeof result).equal('string');
                expect(result.length).above(1);
                expect(result.indexOf('<title>test</title>')).above(-1);
                expect(result.indexOf('rendered with a layout')).above(-1);
                done();
            });
        });

        it('responds with an error when compiling an invalid template', function (done) {

            asyncView.render('blade/uncompiled', { title: 'no compile' }, function (result) {
                expect(result).to.exist;
                expect(typeof result).equal('object');
                expect(result.hasOwnProperty('isBoom')).equal(true);
                expect(result.isBoom).equal(true);
                done();
            });
        });

        it('responds with an error when rendering fails', function (done) {

            asyncView.render('blade/incorrect', { title: 'test', message: 'Hapi' }, function (result) {
                expect(result).to.exist;
                expect(typeof result).equal('object');
                expect(result.hasOwnProperty('isBoom')).equal(true);
                expect(result.isBoom).equal(true);
                expect(result.hasOwnProperty('message')).equal(true);
                expect(result.message.indexOf('undefinedVariable is not defined')).equal(0);
                done();
            });
        });

        it('responds with an error when exceptions are thrown during render', function (done) {

            asyncView.renderAsync(null, null, {}, { title: 'test', message: 'Hapi', content: 'boom!' }, function (result) {
                expect(result).to.exist;
                expect(typeof result).equal('object');
                expect(result.hasOwnProperty('isBoom')).equal(true);
                expect(result.isBoom).equal(true);
                done();
            });
        });

        it('responds with an error when rendering the content template fails (with layouts)', function (done) {

            asyncViewWithLayouts.render('blade/incorrect', { title: 'test', message: 'Hapi' }, function (result) {
                expect(result).to.exist;
                expect(typeof result).equal('object');
                expect(result.hasOwnProperty('isBoom')).equal(true);
                expect(result.isBoom).equal(true);
                done();
            });
        });

        it('responds with an error when the layout context key is used', function (done) {

            asyncViewWithLayouts.render('blade/content', { title: 'test', message: 'Hapi', content: 'boom!' }, function (result) {
                expect(result).to.exist;
                expect(typeof result).equal('object');
                expect(result.hasOwnProperty('isBoom')).equal(true);
                expect(result.isBoom).equal(true);
                done();
            });
        });

        it('should respond with an error when referencing a non-existent layout', function (done) {

            var missingLayoutView = new Views({
                path: viewsPath,
                layout: true,
                layoutKeyword: 'content',
                layoutFile: 'blade/missing.blade',
                engines: {
                    'blade': {
                        module: 'blade',
                        extension: 'blade'
                    }
                },
                asyncCompile: true,
                asyncRender: true,
                cache: false
            });

            missingLayoutView.render('blade/content', { title: 'test', message: 'Hapi' }, function (result) {
                expect(result).to.exist;
                expect(typeof result).equal('object');
                expect(result.hasOwnProperty('isBoom')).equal(true);
                expect(result.isBoom).equal(true);
                done();
            });
        });

    });

    describe('#handler', function () {

        before(function () {

            var options = {
                views: {
                    path: viewsPath
                }
            };

            internals._handlerServer = new Hapi.Server(options);
            internals._handlerServer.route({ method: 'GET', path: '/{param}', handler: { view: 'valid/handler' } });
        });

        it('handles routes to views', function (done) {

            internals._handlerServer.inject({
                method: 'GET',
                url: '/hello'
            }, function (res) {

                expect(res.result).to.contain('hello');
                done();
            });
        });
    });
});
