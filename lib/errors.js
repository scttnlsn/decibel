exports.NotFound = NotFound;
exports.UnsupportedType = UnsupportedType;

function NotFound() {
    Error.call(this);
    this.message = 'Not found';
}

function UnsupportedType(type) {
    Error.call(this);
    this.message = 'Unsupported type: ' + type;
}