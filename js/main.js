(function() {
    "use strict";

    var MIN_X = -18;
    var MAX_X = 19;
    var MIN_Y = -23;
    var MAX_Y = 23;
    var MIN_Z = -1;
    var MAX_Z = 40;

    var SIZE_X = MAX_X - MIN_X;
    var SIZE_Y = MAX_Y - MIN_Y;
    var SIZE_Z = MAX_Z - MIN_Z;

    var MID_X = MIN_X + 0.5 * SIZE_X;
    var MID_Y = MIN_Y + 0.5 * SIZE_Y;
    var MID_Z = MIN_Z + 0.5 * SIZE_Z;

    var EYE_DISTANCE = Math.max(SIZE_X, SIZE_Z)*2.2;
    var EYE_HEIGHT   = MAX_Y/2;

    var TWO_PI = 2 * Math.PI;

    var renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(40, window.innerWidth/window.innerHeight, 1, 500);

    var Line = function(color, startPoint) {
        var geometry = new THREE.Geometry();
        geometry.dynamic = true;
        var material = new THREE.LineBasicMaterial({color: color});
        var mesh = new THREE.Line(geometry, material);

        var PARAM_SIGMA = 10;
        var PARAM_B = 8/3;
        var PARAM_R = 28;
        var DELTA_T = 0.004;
        var MAX_POINTS = 15000;

        var running = true;
        var point = startPoint;
        var points = [point];
        geometry.vertices.push(point);
        for (var i=0; i<MAX_POINTS; i++) {
            point = new THREE.Vector3(
                point.x + PARAM_SIGMA * (point.y - point.x) * DELTA_T,
                point.y + ( (PARAM_R * point.x) - point.y - (point.x * point.z) ) * DELTA_T,
                point.z + ( (point.x * point.y) - (PARAM_B * point.z) ) * DELTA_T
            );
            points.push(point);
            geometry.vertices.push(points[0]);
        }

        var pointsRendered = 1;
        var addPoint = function(originPoint) {
            if (pointsRendered < MAX_POINTS) {
                geometry.vertices.pop(); // Remove origin point
                geometry.vertices.shift(); // Remove duplicate point at start
                geometry.vertices.push(points[pointsRendered++]); // Add new point at end
                geometry.vertices.push(originPoint); // Add new origin point at end
                geometry.verticesNeedUpdate = true;
            } else if (running) {
                running = false;
                // Turn "laser" off
                geometry.vertices.pop();
                geometry.vertices.push(points[pointsRendered]);
                geometry.verticesNeedUpdate = true;
            }
        };

        return {
            mesh: mesh,
            numPoints: function() {
                return pointsRendered;
            },
            isDone: function() {
                return !running;
            },
            addPoint: addPoint
        };
    };

    var REVS_PER_MINUTE = 5;
    var POINTS_PER_SECOND = 60;

    var render = function () {
        requestAnimationFrame(render);

        var delta = clock.getDelta(),
            time = clock.getElapsedTime(),
            angle = time * REVS_PER_MINUTE/60 * TWO_PI;
        camera.position.set(MID_X + EYE_DISTANCE * Math.cos(angle), MID_Y + EYE_HEIGHT, MID_Z + EYE_DISTANCE * Math.sin(angle));

        camera.lookAt(new THREE.Vector3(MID_X, MID_Y, MID_Z));

        var originPoint = new THREE.Vector3(MID_X + EYE_DISTANCE/1.5 * Math.cos(angle+Math.PI/2), MID_Y + EYE_HEIGHT, MID_Z + EYE_DISTANCE/1.5 * Math.sin(angle+Math.PI/2));

        lines.forEach(function(line) {
            if (!line.isDone()) {
                for (var i=0; i<Math.floor(POINTS_PER_SECOND * time - line.numPoints()); i++) {
                    line.addPoint(originPoint);
                }
            }
        });

        renderer.render(scene, camera);
    };

    var startPoint = new THREE.Vector3(
        MIN_X + Math.random() * SIZE_X,
        MIN_Y + Math.random() * SIZE_Y,
        MIN_Z + Math.random() * SIZE_Z
    );
    var startPoint2 = startPoint.clone();
    startPoint2.x += 0.01;
    var startPoint3 = startPoint2.clone();
    startPoint3.x += 0.01;
    var lines = [
        new Line(0xff5600, startPoint),
        new Line(0x5fff00, startPoint2),
        new Line(0x1387ff, startPoint3)
    ];
    lines.forEach(function(line){
        scene.add(line.mesh);
    });

    var clock = new THREE.Clock();
    render();
})();
