class TempExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this.viewer = viewer;
        this.tree = null;
        this.sceneBuilder = null;
        this.myCustomMaterial = null;


        this.customize = this.customize.bind(this);
        this.getMeshFromFragment = this.getMeshFromFragment.bind(this);
        this.replaceOriginalWithCustom = this.replaceOriginalWithCustom.bind(this);
        this.replaceMaterialOnOriginalModel = this.replaceMaterialOnOriginalModel.bind(this);
        this.addCustomMesh = this.addCustomMesh.bind(this);
    }

    load() {
        console.log('tempExtension is loaded!');
        this.viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
            this.customize);

        return true;
    }

    unload() {
        console.log('tempExtension is now unloaded!');

        return true;
    }

    customize() {
        this.viewer.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
            this.customize);

        this.tree = this.viewer.model.getData().instanceTree;


        this.myCustomMaterial = new THREE.MeshPhongMaterial({
            side: THREE.DoubleSide,
            reflectivity: 0.0,
            flatShading: true,
            transparent: true,
            opacity: 1,
            color: new THREE.Color(0x0000ff)
        })

        this.viewer.impl.matman().addMaterial("my_material", this.myCustomMaterial, true);

        this.viewer.loadExtension("Autodesk.Viewing.SceneBuilder").then(() => {
            this.sceneBuilder = this.viewer.getExtension("Autodesk.Viewing.SceneBuilder");

            this.sceneBuilder.addNewModel({})
                .then((modelBuilder) => {
                    this.modelBuilder = modelBuilder;
                    window.modelBuilder = modelBuilder;


                    // setTimeout(() => {
                    this.replaceOriginalWithCustom();
                    // this.replaceMaterialOnOriginalModel();
                    this.addCustomMesh();
                    // }, 2000);
                });
        })
    }

    replaceOriginalWithCustom() {
        this.viewer.setGhosting(false)
        const ids = Object.keys(this.tree.nodeAccess.dbIdToIndex)
        ids.forEach(id => {

            this.tree.enumNodeFragments(parseInt(id), fragID => {
                console.log("ID = ", id, "; FragID = ", fragID, " | Replacing model");
                this.viewer.hide(parseInt(id));
                let mesh = null;
                try {
                    mesh = this.getMeshFromFragment(fragID)
                } catch (err) {
                    console.log("Problem getting mesh for ID = ", id, "; FragID = ", fragID)
                    return;
                }
                this.modelBuilder.addMesh(mesh);

            })

        })
    }

    replaceMaterialOnOriginalModel() {
        const ids = Object.keys(this.tree.nodeAccess.dbIdToIndex)
        ids.forEach(id => {
            this.tree.enumNodeFragments(parseInt(id), fragID => {
                console.log("ID = ", id, "; FragID = ", fragID, " | Changing material");
                this.viewer.model.getFragmentList().setMaterial(fragID, this.viewer.impl.matman()._materials["my_material"]);
            })
        })
    }

    getMeshFromFragment(fragmentId) {


        let geom = new THREE.Geometry();
        let renderProxy = this.viewer.impl.getRenderProxy(this.viewer.model, fragmentId);
        let VE = Autodesk.Viewing.Private.VertexEnumerator;

        VE.enumMeshVertices(renderProxy.geometry, (v, i) => {
            geom.vertices.push(new THREE.Vector3(v.x, v.y, v.z));
        });

        VE.enumMeshIndices(renderProxy.geometry, (a, b, c) => {
            geom.faces.push(new THREE.Face3(a, b, c))
        });


        geom.computeFaceNormals();


        let mesh = new THREE.Mesh(
            new THREE.BufferGeometry().fromGeometry(geom),
            this.viewer.impl.matman()._materials["my_material"]);

        mesh.matrix = renderProxy.matrixWorld.clone();

        window.renderProxy = renderProxy;

        return mesh
    }

    addCustomMesh() {


        let box = new THREE.BoxGeometry(20, 20, 20);

        let bufferGeometry = new THREE.BufferGeometry().fromGeometry(box);
        let mesh = new THREE.Mesh(bufferGeometry, this.myCustomMaterial);
        this.modelBuilder.addMesh(mesh);

    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('TempExtension',
    TempExtension);
