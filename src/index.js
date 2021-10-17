import JumpGame from './JumpGame';
function main() {
  const canvas = document.querySelector('canvas');
  new JumpGame({
    canvas,
    helper: {
      axesHelpers: true,
      cameraHelpers: false
    }
  }).start();
}

main();