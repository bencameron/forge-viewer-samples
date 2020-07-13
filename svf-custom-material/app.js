let divId = "MyViewerDiv";
let viewer;

async function setupViewer() {
    let tokenFetchingUrl = "SET TOKEN URL HERE";
    let options = {
        env: 'AutodeskProduction',
        getAccessToken: (onGetAccessToken) => {
            fetch(tokenFetchingUrl)
                .then(response => response.json())
                .then(data => {

                    let accessToken = data.accessToken;
                    let expireTimeSeconds = data.expiresIn;
                    onGetAccessToken(accessToken, expireTimeSeconds);
                })
        },
        useADP: false
    };
    
    await new Promise(function (resolve, reject) {
        Autodesk.Viewing.Initializer(options, function () {
            resolve();
        });
    });

    viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById(divId), {});
    viewer.start();

    const cacheDate = new Date();
    cacheDate.setDate(cacheDate.getDate() - 1);
    Autodesk.Viewing.endpoint['HTTP_REQUEST_HEADERS']['If-Modified-Since'] = cacheDate.toUTCString();

    await addSvf("urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YnVya2UtZmlsZXMvMjcwLTAxMzBfd2hpdGUuZHdn", viewer, new THREE.Vector3(-10, 0, 0));

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

    viewer.addEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, onSelection)
}

async function addSvf(documentId, viewer, position) {
    let matrix = new THREE.Matrix4();
    matrix.setPosition(position);

    return new Promise((resolve, reject) => {
        let onDocumentLoadSuccess = (doc) => {
            var viewables = doc.getRoot().search({'role': '3d'})[0];

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

  function onSelection(event) {
    if (event.selections && event.selections.length > 0) {
        let selection = event.selections[0];
        setFragmentMaterial(selection.model, selection.dbIdArray[0])
    }    
  }

  function setFragmentMaterial(model, nodeId) {
    const myCustomMaterial = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
      reflectivity: 0.0,
      flatShading: true,
      transparent: true,
      opacity: 1,
      color: new THREE.Color(0x0000ff)
    });

    const materials = viewer.impl.matman();
    materials.addMaterial("MyCustomMaterial", myCustomMaterial, true);

    const tree = model.getData().instanceTree;

    tree.enumNodeFragments(nodeId, (fragId) => {
      model.getFragmentList().setMaterial(fragId, myCustomMaterial);
    })

    viewer.impl.invalidate(true);
    viewer.clearSelection();
  }