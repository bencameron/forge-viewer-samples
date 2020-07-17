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

}
