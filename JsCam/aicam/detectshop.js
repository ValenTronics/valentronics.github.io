
var recording = 0;
class App extends React.Component {
  // reference to both the video and canvas
  videoRef = React.createRef();
  canvasRef = React.createRef();

  // we are gonna use inline style
  styles = {
    /*position: 'fixed',
    top: 150,
    left: 115,*/
  };


  detectFromVideoFrame = (model, video) => {
    
    if(detectObjects){
    model.detect(video).then(predictions => {
      this.showDetections(predictions);

      requestAnimationFrame(() => {
        this.detectFromVideoFrame(model, video);
      });
    }, (error) => {
      console.log("Couldn't start the webcam");
      console.error(error);
    });
  }
  };

  showDetections = predictions => {
    const ctx = this.canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const font = "24px helvetica";
    ctx.font = font;
    ctx.textBaseline = "top";

    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];
      let thing = prediction.class;
      document.getElementById("objectdetection").innerHTML = thing;
      if(!recording){
      if(thing.includes("dog") || thing.includes("person")){
        getVid(window.stream,thing);
      }
    }
      // Draw the bounding box.
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, width, height);
      // Draw the label background.
      ctx.fillStyle = "#d4af37";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10);
      // draw top left rectangle
      ctx.fillRect(x, y, textWidth + 10, textHeight + 10);
      // draw bottom left rectangle
      ctx.fillRect(x, y + height - textHeight, textWidth + 15, textHeight + 10);

      // Draw the text last to ensure it's on top.
      ctx.fillStyle = "#000000";
      ctx.fillText(prediction.class, x, y);
      ctx.fillText(prediction.score.toFixed(2), x, y + height - textHeight);
    });
  };

  componentDidMount() {
    if (navigator.mediaDevices.getUserMedia || navigator.mediaDevices.webkitGetUserMedia) {
      // define a Promise that'll be used to load the webcam and read its frames
      const webcamPromise = navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: "environment",
            width: {min: 320, ideal: 1280, max: 1920},
            height: {min: 240, ideal: 720, max: 1080},
          },
          audio: true
        })
        .then(stream => {
          // pass the current frame to the window.stream
          window.stream = stream;
          // pass the stream to the videoRef
          this.videoRef.current.srcObject = stream;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
          const track = stream.getVideoTracks()[0];

      //Create image capture object and get camera capabilities
      const imageCapture = new ImageCapture(track);
      const photoCapabilities = imageCapture.getPhotoCapabilities().then(() => {

        //todo: check if camera has a torch

        //let there be light!
        track.applyConstraints({
            advanced: [{torch: true}]
          });
      });
///////////////////////////////////////////////////////////////////////////////////          
          
          return new Promise(resolve => {
          this.videoRef.current.onloadedmetadata = () => {
              resolve();
            };
          });
        }, (error) => {
          console.log("Couldn't start the webcam")
          console.error(error)
        });

      // define a Promise that'll be used to load the model
      const loadlModelPromise = cocoSsd.load();
      
      // resolve all the Promises
      Promise.all([loadlModelPromise, webcamPromise])
        .then(values => {
          this.detectFromVideoFrame(values[0], this.videoRef.current);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }

  // here we are returning the video frame and canvas to draw,
  // so we are in someway drawing our video "on the go"
  render() {
    return (
      <div> 
        <video
          style={this.styles}
          autoPlay
          muted
          ref={this.videoRef}
          width="720"
          height="600"
        />
        <canvas style={this.styles} ref={this.canvasRef} width="720" height="650" />
      </div>
    );
  }
}

const domContainer = document.querySelector('#root');
ReactDOM.render(React.createElement(App), domContainer);
