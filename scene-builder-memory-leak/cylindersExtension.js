class CylindersExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this.viewer = viewer;
        this.sceneBuilder = null;

        this.customize = this.customize.bind(this);
        this.onToolbarCreated = this.onToolbarCreated.bind(this);
        this.resetGraphics = this.resetGraphics.bind(this);
        this.addCylinders = this.addCylinders.bind(this);
        this.removeMeshes = this.removeMeshes.bind(this);
        this.meshes = [];
    }

    load() {
        console.log('cylindersExtension is loaded!');
    
        this.customize();

        return true;
    }

    unload() {
        console.log('cylindersExtension is now unloaded!');

        return true;
    }

    customize() {
        this.viewer.removeEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
            this.customize);

        this.viewer.loadExtension("Autodesk.Viewing.SceneBuilder").then(() => {
            this.sceneBuilder = this.viewer.getExtension("Autodesk.Viewing.SceneBuilder");

            this.sceneBuilder.addNewModel({})
                .then((modelBuilder) => {
                    this.modelBuilder = modelBuilder;
                    window.modelBuilder = modelBuilder;
                    this.addCylinders(720);
                    
                    const camera = this.viewer.getCameraFromViewArray([
                        0, -50, 50,
                        0, 0, 0,
                        0, 0, 1,
                        1,
                        50 * Math.PI / 180,
                        60,
                        0
                    ]);
                    this.viewer.impl.setViewFromCamera(camera, true, true);
                    this.viewer.impl.controls.recordHomeView();                    
                });
        })        

        this.viewer.addEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
            this.onToolbarCreated);
    }

    onToolbarCreated() {
      // Create a new toolbar group if it doesn't exist
      const group = new Autodesk.Viewing.UI.ControlGroup('CylindersExtension');
      this.viewer.toolbar.addControl(group);

      // Add a new button to the toolbar group
      const resetMeshesButton = new Autodesk.Viewing.UI.Button('RecreateMeshes');

      resetMeshesButton.onClick = (ev) => {
        this.resetGraphics(720);
      };

      resetMeshesButton.setToolTip('Recreate Cylinders');
      group.addControl(resetMeshesButton);

    }

    resetGraphics(numCylinders) {
        this.removeMeshes();
        this.addCylinders(numCylinders);
    }

    addCylinders(numCylinders) {
        console.log('Creating cylinders');

        for (let index = 0; index < numCylinders; index++) {
            const material = new THREE.MeshPhongMaterial({
                color: new THREE.Color(1, 0, 1)
            });
    
            const cylinderGeometry = new THREE.CylinderGeometry(2, 2, 10, 8, 1, false, 0, Math.PI * 2);
            const bufferGeometry = new THREE.BufferGeometry().fromGeometry(cylinderGeometry);
            const mesh = new THREE.Mesh(bufferGeometry, material);
            mesh.matrix = new THREE.Matrix4().compose(
                new THREE.Vector3(index * 2, 0, 0),
                new THREE.Quaternion(0, 0, 0, 1),
                new THREE.Vector3(1, 1, 1)
            );
    
            this.meshes.push(mesh);
            this.modelBuilder.addMesh(mesh);
        }            
    }
    
    removeMeshes() {
        if (!this.meshes || this.meshes.length === 0) {
            return;
        }
    
        console.log('Removing existing meshes');

        const matMan = this.viewer.impl.matman();
        this.meshes.forEach(mesh => {
            this.modelBuilder.removeMesh(mesh);
            this.modelBuilder.removeGeometry(mesh.geometry);

            const matName = `model:1|mat:${mesh.material.materialManagerName}`;
            matMan.removeMaterial(matName);
        })
    
        this.meshes.length = 0;
    }    
}

Autodesk.Viewing.theExtensionManager.registerExtension('CylindersExtension',
CylindersExtension);
