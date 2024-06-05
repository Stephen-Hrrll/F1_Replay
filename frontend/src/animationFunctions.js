let FRAME_NUM = 0;
let animation_id = null;
export function draw_drivers(drivers, ctx){
    
    ctx.font = '24px Arial'; // Set the desired font size and family
    ctx.fillStyle = '#FFFFFF'; // Set text color
    function frame() {
        // clear the canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        drivers.forEach(driver => {
            if (driver.norm_x || driver.norm_y){
                //console.log("driver",driver);
                if (FRAME_NUM > driver.norm_x.length - 1) {
                    stop_animation(); // Stop the animation when it reaches the end of location data
                } 
                const x1 = driver.norm_x[FRAME_NUM];
                const y1 = driver.norm_y[FRAME_NUM];
                // draw a blue circle for the driver
                ctx.beginPath();
                ctx.arc(x1, y1, 5, 0, 2 * Math.PI);
                ctx.fillStyle = "#" + driver.team_color;
                ctx.fill();
                ctx.stroke();


                ctx.fillStyle = '#000000';
                let elapsedTimeInSeconds = drivers[0].telem_data.SessionTime[FRAME_NUM] - drivers[0].telem_data.SessionTime[0];
                const formattedTime = formatElapsedTime(elapsedTimeInSeconds);
                // Format elapsedTime as needed for display
                ctx.fillText(`Time: ${formattedTime}`, 10, 20); // Example position

            }

            
        });
        FRAME_NUM += 1;
        animation_id = requestAnimationFrame(frame); // call frame again for the next part of the animation
    }
    animation_id = requestAnimationFrame(frame); // Start the animation
}

function formatElapsedTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds % 1) * 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
}

export function draw_track(track_coords, ctx) {
    

    
  
    let posX = 0; // Starting position
    let fram_num = 1;
  
    function frame() {
      if (fram_num > track_coords.X.length - 1) {
          return; // Stop the animation when it reaches the end of location data
      } 
          const x1 = track_coords.X[fram_num];
          const y1 = track_coords.Y[fram_num];
         
          const x2 = track_coords.X[fram_num + 1];
          const y2 = track_coords.Y[fram_num + 1];
      
  
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          fram_num += 1;
          
          requestAnimationFrame(frame); // call frame again for the next part of the animation
      
    }
    requestAnimationFrame(frame); // Start the animation
  
  }

export function pause_animation(){
    // stop the animation
    if (animation_id){
        cancelAnimationFrame(animation_id);
        animation_id = null;
        console.log("paused animation at frame number: ", FRAME_NUM);
    }
}

export function stop_animation(ctx){
    
    // stop the animation
    if (animation_id){
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        cancelAnimationFrame(animation_id);
        animation_id = null;
        console.log("stopped animation");
        FRAME_NUM = 0;
    }
}