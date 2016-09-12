// this plugin provides ATM one helper to easily compute the publicPath of assets
export default function helpers(filenames, metalsmith, cb) {
  metalsmith.metadata().h = {
    publicPath(relativeAssetPath) {
      const root = process.env.DOCS_MOUNT_POINT || '/';
      return `${root}${relativeAssetPath}`;
    },
  };

  cb();
}
