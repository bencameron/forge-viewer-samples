///////////////////////////////////////////////////////////////////////////////
// GLStats extension to be used to check satus of WebGl2 context
// by Denis Grigor, February 2021
//
///////////////////////////////////////////////////////////////////////////////

class GLStatsExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this.viewer = viewer;
        this.tree = null;

        this.customize = this.customize.bind(this);
    }

    load() {
        console.log('GLStatsExtension is loaded!');
        this.viewer.addEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
            this.customize);

        return true;
    }
    unload() {
        console.log('GLStatsExtension is now unloaded!');

        return true;
    }

    customize() {
        this.viewer.removeEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
            this.customize);

        //Start coding here ...


        let gl = this.viewer.canvas.getContext("webgl2");
        console.log(gl);
        let bench = new GLBench(gl,
            // {
            //     withoutUI: false,
            //     trackGPU: false,      // don't track GPU load by default
            //     chartHz: 20,          // chart update speed
            //     chartLen: 20,
            //     paramLogger: (i, cpu, gpu, mem, fps, totalTime, frameId) => { console.log(
            //         "CPU: ", cpu,
            //         "GPU: ", gpu,
            //         "MEM:", mem,
            //         "FPS: ",fps) },
            //     // chartLogger: (i, chart, circularId) => { console.log('chart circular buffer=', chart) },
            // }
            {
                css: CSS,
                chartHz: 1,
                paramLogger: (i, cpu, gpu, mem, fps, totalAccum, frameId) => {
                    console.log(
                        'cpu_ms=' + (cpu * totalAccum / 100 / frameId).toFixed(3) +
                        ', gpu_ms=' + (gpu * totalAccum / 100 / frameId).toFixed(3) +
                        ', frametime=' + (totalAccum / frameId).toFixed(3) +
                        ', mem_heap=' + mem.toFixed(1)
                    );
                },
                // chartLogger: (i, chart, circularId) => {
                //     console.log('circularId=' + circularId.toFixed(0) + ', chart=' + chart.reduce((accum, i) => accum + ',' + i.toFixed(0), ''));
                // },
            }
            );

// engine initialization with instanced_arrays/draw_buffers webgl1 extensions goes after!

        function draw(now) {
            bench.begin('first measure');
        //     // some bottleneck
            // bench.end('first measure');
        //
        //     // bench.begin('second measure');
        //     // some bottleneck
        //     // bench.end('second measure');
        //
            bench.nextFrame(now);
            requestAnimationFrame(draw);
        }
        requestAnimationFrame(draw);
    }

}

Autodesk.Viewing.theExtensionManager.registerExtension('GLStatsExtension',
    GLStatsExtension);