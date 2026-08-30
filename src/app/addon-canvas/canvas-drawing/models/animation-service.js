export default class AnimationService {
    id = 0;
    fpsInterval = 0;
    startAnimationTime = null;
    startFrameTime = null;
    time2 = null;
    elapsedTime = 0;
    sumTime = 0;
    hits = 0;
    animationRunning = false;
    animationEnd = true;
    functions = null;
    constructor() {
        this.initialize();
    }
    initialize() {
        this.id = 0;
        this.fpsInterval = 0;
        this.sumTime = 0;
        this.hits = 0;
        this.startAnimationTime = null;
        this.startFrameTime = null;
        this.animationRunning = false;
        this.animationEnd = true;
        this.functions = [];
        this.animationParams = {};
    }
    stopAnimationRunning() {
        this.setAnimationRunning(false);
    }
    getAnimationEnd() {
        return this.animationEnd;
    }
    /**
     * 
     * @param {type} b
     * @returns {boolean}
     */
    setAnimationEnd(b) {
        if (b === true) {
            this.animationRunning = false;
        }
        this.animationEnd = b;
    }
    /**
     * 
     * @param {type} b
     * @returns {boolean}
     */
    setAnimationRunning(b) {
        if (b === true) {
            this.animationEnd = false;
        }
        this.animationRunning = b;
        return b;
    }
    /**
     * 
     * @returns {type}
     */
    getAnimationRunning() {
        return this.animationRunning;
    }
    startAnimation(fps, f, bFirstDraw, params) {
        this.bRafSupport = this.testRafSupport();

        if (typeof this.functions[f] !== 'function') {
            this.setAnimationEnd(true);
            return false;
        }

        this.id = `${Date.now()}_${Math.floor(Math.random() * 10000000)}`;

        if (params === null || typeof params !== 'object') {
            params = {};
        }

        params.i = 0;

        if (bFirstDraw === true) {
            this.functions[f](params);
            params.i++;
        }

        this.fpsInterval = 1000 / fps;
        this.startFrameTime = Date.now();

        this.setAnimationRunning(true);
        this.animationEnd = false;

        this.startAnimationTime = new Date();

        if (this.bRafSupport === true) {
            return this.animateWithRaf(f, params, this.id, 1);
        } else {
            return this.animateWithTimeOut(f, this, this.fpsInterval, params, this.id);
        }
    }
    getFpsRate() {
        return Math.round(this.hits / (new Date() - this.startAnimationTime) / 1000);
    }
    getAnimationTime() {
        return Math.round((new Date() - this.startAnimationTime) / 1000);
    }
    /**
     * 
     * @returns {Boolean}
     */
    ctrlFps() {
        // calc elapsed time since last loop
        const currentTime = Date.now();
        this.elapsedTime = currentTime - this.startFrameTime;

        if (this.elapsedTime > this.fpsInterval) {
            // Get ready for next frame by setting then=now, but...
            // Also, adjust for fpsInterval not being multiple of 16.67
            this.startFrameTime = currentTime - (this.elapsedTime % this.fpsInterval);
            return true;
        }
        return false;
    }
    animateWithRaf(f, params, id, indice) {
        if (indice !== 1 && this.animationEnd === true) {
            return false;
        }

        if (this.id !== id) {
            // if id has changed
            return false;
        }

        if (this.requestAnimationFrame_(() => this.animateWithRaf(f, params, id)) < 0) {
            return false;
        }

        if (this.animationEnd === true) {
            return false;
        }

        if (this.animationRunning === true) {
            if (this.ctrlFps() === true) {
                this.hits++;

                try {
                    // execute function
                    if (this.functions[f](params) === false) {
                        // function return false, stop animation
                        this.setAnimationEnd(true);
                        return false;
                    }
                } catch (error) {
                    console.error(error);
                    this.setAnimationEnd(true);
                    return false;
                }

                params.i++;
            }
        }

        return true;
    }
    /**
     * 
     * @param {type} f
     * @returns {Number|Window.webkitRequestAnimationFrame|window.webkitRequestAnimationFrame}
     */
    requestAnimationFrame_(f) {
        try {
            return window.requestAnimationFrame(f) ||
                window.mozRequestAnimationFrame(f) ||
                window.webkitRequestAnimationFrame ||
                window.oRequestAnimationFrame(f) ||
                window.msRequestAnimationFrame(f) ||
                null;
        } catch (err) {
            console.error(err);
            return -1;
        }
    }
    /**
     * 
     * @param {type} f_
     * @param {type} that_
     * @param {type} t_
     * @param {type} params_
     * @param {type} id_
     * @returns {Boolean}
     */
    animateWithTimeOut(f_, that_, t_, params_, id_) {
        if (typeof f_ === 'function') {
            that_.animationParams.f = f_;
            that_.animationParams.t = t_;
            that_.animationParams.params = params_;
            that_.animationParams.id_ = id_;
            window.that = that_;
        }

        if (window.that.getAnimationRunning() === true) {
            // execute function
            if (window.that.functions[window.that.animationParams.f](window.that.animationParams.params) === false) {
                window.that.stopAnimationRunning(true);
                return false;
            } else {
                window.that.animationParams.params.i++;
                setTimeout(window.that.animateWithTimeOut, window.that.animationParams.t);
                return true;
            }
        }

        return false;
    }

    /**
     * 
     * * 
     * @returns {Boolean}
     */
    testRafSupport() {
        try {
            const rafTest = window.requestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                null;

            if (rafTest === null) {
                // animation frame not available
                return false;
            }
        } catch (err) {
            return false;
        }

        // test
        return (this.requestAnimationFrame_(function () { }) !== -1);
    }
}
