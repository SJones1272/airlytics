class AnimatedValue {
    constructor(target) {
        this.target = target;
    }

    set(target) {
        this.target = target;
        this.active = true;
    }

    update() {
        return this.target;
    }
}

export default AnimatedValue;
