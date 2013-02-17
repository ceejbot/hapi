// Load modules

var Cacheable = require('./cacheable');
var Utils = require('../utils');


// Declare internals

var internals = {};


// View response (Base -> Generic -> Cacheable -> View)

module.exports = internals.View = function (manager, template, context, options) {

    Cacheable.call(this);
    this.variety = 'view';
    this.varieties.view = true;

    this.view = {
        manager: manager,
        template: template,
        context: context,
        options: options
    };

    return this;
};

Utils.inherits(internals.View, Cacheable);


internals.View.prototype._prepare = function (request, callback) {

    var self = this;
    this._wasPrepared = true;

    this.view.manager.render(this.view.template,
            this.view.context,
            this.view.options,
    function (rendered) {

        if (rendered instanceof Error) {
            return callback(rendered);
        }

        self._payload = [rendered];
        self._headers['Content-Type'] = (self.view.manager.settings.engine && self.view.manager.settings.engine['Content-Type']) || 'text/html';
        Cacheable.prototype._prepare.call(self, request, callback);
    });
};

