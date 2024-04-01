async function point(P)
{
    let V_inv = math.inv(cube_data.V);
    let cmp_scale = cube_data.base_scale*cube_data.zoom;

    let C = mat_mult(V_inv, [0,0,-1]);
    let Cmag = math.norm(C, 2);
    C = C.map((e) => (e/Cmag));

    let xloc = mat_mult(V_inv, [1,0,0]);
    let xlocmag = math.norm(xloc, 2);
    xloc = xloc.map((e) => (e/xlocmag));

    // beta2: project local positive z axis onto plane of screen
        // Also normalize
        let kh = [0, 0, 1];
        let temp_dot = dot(kh, C);
        let temp = C.map((e) => (e*temp_dot));
        let beta2 = kh.map((e,i) => (e - temp[i]));
        let beta2mag = math.norm(beta2, 2);
        beta2 = beta2.map((e) => (e/beta2mag));

    // beta1: project coordinate vector (P) onto plane of screen
                // Also normalize
                temp_dot = dot(P, C);
                temp = C.map((e) => (e*temp_dot));
                let beta1 = P.map((e,i) => (e - temp[i]));
                let ll = math.norm(beta1, 2);
                beta1 = beta1.map((e) => (e/ll));

                // Get angle from beta1 to beta2
                // Next, make sure it is in range.
                temp = dot(beta1, beta2)
                if (temp <= -1) {
                    temp = -1;
                }
                if (temp >= 1) {
                    temp = 1;
                }

    // Get angle from beta1 to beta
                let ab1b2 = Math.acos(dot(beta1, beta2))*180/Math.PI;

    // Get projectin angle
    let a = NaN;
    if (dot(beta1, xloc) > 0) {
        a = -90 + ab1b2;
    }
    else {
        a = -90 - ab1b2;
    }

    // Projection length: we already calculated it back at ll
                canv_x = ll*Math.cos(a*Math.PI/180)*cmp_scale;
                canv_y = ll*Math.sin(a*Math.PI/180)*cmp_scale
    
    // Mark it on canvas
    ctx.fillRect(canv_x + canv.width / 2, canv_y + canv.height / 2, 10, 10);
    console.log(canv_x);
    console.log(canv_y);
}