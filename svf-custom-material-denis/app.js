function setupViewer(divId, documentId, tokenFetchingUrl, extensionArray, callback) {

    let viewer;

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

    let config3d = {
        extensions: extensionArray
    };


    Autodesk.Viewing.Initializer(options, () => {

        viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById(divId), config3d);
        viewer.start();
        Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
        // viewer.addEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, onSelection)
    });

    // Init after the viewer is ready
    function onDocumentLoadSuccess(doc) {
        const viewables = doc.getRoot().search({'role': '3d'})[0];
        viewer.loadDocumentNode(doc, viewables).then(i => {

        });

        // for debugging
        window.dbg_viewer = viewer;

    }

    function onDocumentLoadFailure(viewerErrorCode) {
        console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
    }

    function onItemLoadSuccess(active_viewer, item) {
        console.log('Document loaded successfully');
    }

    function onItemLoadFail(errorCode) {
        console.error('onItemLoadFail() - errorCode:' + errorCode);
    }

    //
    //
    // function onSelection(event) {
    //     if (event.selections && event.selections.length > 0) {
    //         console.log(event.selections)
    //         let selection = event.selections[0];
    //         setFragmentMaterial(selection.model, selection.dbIdArray[0])
    //     }
    // }
    //
    // function setFragmentMaterial(model, nodeId) {
    //     const myCustomMaterial = new THREE.MeshPhongMaterial({
    //         side: THREE.DoubleSide,
    //         reflectivity: 0.0,
    //         flatShading: true,
    //         transparent: true,
    //         opacity: 1,
    //         color: new THREE.Color(0x0000ff)
    //     });
    //
    //     const materials = viewer.impl.matman();
    //     materials.addMaterial("MyCustomMaterial", myCustomMaterial, true);
    //
    //     const tree = model.getData().instanceTree;
    //
    //     tree.enumNodeFragments(nodeId, (fragId) => {
    //         model.getFragmentList().setMaterial(fragId, myCustomMaterial);
    //     })
    //
    //     viewer.impl.invalidate(true);
    //     viewer.clearSelection();
    // }
    //
    // function addCustomMesh(modelBuilder) {
    //     const myCustomMaterial = new THREE.MeshPhongMaterial({
    //         side: THREE.DoubleSide,
    //         reflectivity: 0.0,
    //         flatShading: true,
    //         transparent: true,
    //         opacity: 1,
    //         color: new THREE.Color(0x0000ff)
    //     })
    //
    //     // Torus
    //     // let geometry = new THREE.BoxGeometry(200, 200, 200);
    //     //
    //     bufferGeometry = new THREE.BufferGeometry().fromGeometry(getMeshFromFragment(1));
    //     mesh = new THREE.Mesh(bufferGeometry, myCustomMaterial);
    //     modelBuilder.addMesh(mesh);
    //
    // }

}
