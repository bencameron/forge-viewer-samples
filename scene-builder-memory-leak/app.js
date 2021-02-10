async function setupViewer(divId, extensionArray) {
    const options = {
        // env: "Local",
    };
    
    let config3d = {
         extensions: extensionArray
    };

    await new Promise(function (resolve, reject) {
        Autodesk.Viewing.Initializer(options, function () {
            resolve();
        });
    });

    viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById(divId), config3d);
    viewer.start();
}
