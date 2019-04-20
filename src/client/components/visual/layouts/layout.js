class Layout {
    constructor(options) {
        Object.assign(this, options);
        this.options = {};
    }

    apply(options = {}) {
        console.log(options);
        this.options = options;
        this.layout(this.options);
    }

    reapply() {
        this.layout(this.options);
    }
}

export default Layout;