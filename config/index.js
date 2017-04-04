var Config = function (){
    this.base = require(__dirname + '/base.json');
    this.environment = process.env.NODE_ENV;
    this.file = require(__dirname + '/' + this.environment + '.json');
    this.merged = null;

    this.merge();
}

Config.prototype.merge = function merge() {
    var file = this.file;
    this.parse(file);    

    var res = this.base;

    for (var key in file) {
        res[key] = this.file[key];
    };

    this.merged = res;
};

Config.prototype.parse = function parse(current) {
    for (var key in current) {
        if (typeof current[key] === 'string') {
            if (current[key][0] === '$') {
                var newKey = current[key].substring(1);
                current[key] = process.env[newKey];
            }; 
        } else {
            this.parse(current[key]);
        };
    };
    return;
};

Config.prototype.get = function get(key) {
    var arr = key.split('.');
    var res = this.merged;

    for (var i = 0; i < arr.length; i++) {
        if (res[arr[i]]) {
            res = res[arr[i]];
        } else {
            break;
        }
    }  

    if (i === arr.length - 1) {
        return undefined;
    } else {
        return res;
    };
};

module.exports = Config;