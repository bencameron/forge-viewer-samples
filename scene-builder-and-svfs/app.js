let divId = "MyViewerDiv";
let viewer;

async function setupViewer() {
    let tokenFetchingUrl = "";
    let options = {
        env: 'AutodeskProduction',
        getAccessToken: (onGetAccessToken) => {
            fetch(tokenFetchingUrl)
                .then(response => response.json())
                .then(data => {

                    let accessToken = data["access_token"];
                    let expireTimeSeconds = data["expires_in"];
                    onGetAccessToken(accessToken, expireTimeSeconds);
                })
        },
        useADP: false,
    };
    
    await new Promise(function (resolve, reject) {
        Autodesk.Viewing.Initializer(options, function () {
            resolve();
        });
    });

    viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById(divId), {});
    viewer.start();
    await viewer.loadExtension('Autodesk.Viewing.SceneBuilder');
    ext = viewer.getExtension('Autodesk.Viewing.SceneBuilder');
    modelBuilder = await ext.addNewModel({});

    addCustomMesh(modelBuilder);
    await addSvf("urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dGVjaC1zYW5kYm94L0Nvcm5lclNoZWx2ZS5mM2Q", viewer, new THREE.Vector3(-250, 0, 0));
    await addSvf("urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dGVjaC1zYW5kYm94L0Nvcm5lclNoZWx2ZS5mM2Q", viewer, new THREE.Vector3(50, 0, 0));

    const camera = viewer.getCameraFromViewArray([
        0, -50, 50,
        0, 0, 0,
        0, 0, 1,
        1,
        50 * Math.PI / 180,
        60,
        0
    ]);
    viewer.impl.setViewFromCamera(camera, true, true);
    viewer.impl.controls.recordHomeView();
}

function addCustomMesh(modelBuilder) {
    purple = new THREE.MeshPhongMaterial({
        color: new THREE.Color(1, 0, 1)
    });

    // Torus
    let geometry = new THREE.TorusGeometry(10, 2, 32, 32);

    bufferGeometry = new THREE.BufferGeometry().fromGeometry(geometry);
    mesh = new THREE.Mesh(bufferGeometry, purple);
    modelBuilder.addMesh(mesh);
}

async function addSvf(documentId, viewer, position) {
    let matrix = new THREE.Matrix4();
    matrix.setPosition(position);

    return new Promise((resolve, reject) => {
        let onDocumentLoadSuccess = (doc) => {
            var viewables = doc.getRoot().getDefaultGeometry();

            let opt = {
                placementTransform: matrix,
                globalOffset:{x:0,y:0,z:0},
                preserveView: true,
                keepCurrentModels: true
            }

            viewer.loadDocumentNode(doc, viewables, opt).then(i => {
                resolve()
            });
        }

        let onDocumentLoadFailure = (viewerErrorCode) => {
            console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
            reject()
        }

        Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
    })
  }