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
        var addPoint = function() {
            if (pointsRendered < MAX_POINTS) {
                geometry.vertices.shift();
                geometry.vertices.push(points[pointsRendered++]);
                geometry.verticesNeedUpdate = true;
            }
        };

        return {
            mesh: mesh,
            lastPoint: function() {
                return points[pointsRendered-1];
            },
            addPoint: addPoint
        };
    };

    var Axes = function() {
        var geometry = new THREE.Geometry();
        geometry.vertices = [
            new THREE.Vector3(MIN_X, MID_Y, MID_Z),
            new THREE.Vector3(MAX_X, MID_Y, MID_Z),
            new THREE.Vector3(MID_X, MID_Y, MID_Z),
            new THREE.Vector3(MID_X, MIN_Y, MID_Z),
            new THREE.Vector3(MID_X, MAX_Y, MID_Z),
            new THREE.Vector3(MID_X, MID_Y, MID_Z),
            new THREE.Vector3(MID_X, MID_Y, MIN_Z),
            new THREE.Vector3(MID_X, MID_Y, MAX_Z)
        ];
        var material = new THREE.LineBasicMaterial({
            color: 0xffff00
        });
        var mesh = new THREE.Line(geometry, material);
        return {mesh: mesh};
    };

    var now = function() {
        return performance && performance.now() || Date.now();
    };

    var REVS_PER_SECOND = 0.01;

    var render = function () {
        var _now = now();
        if (_now - startTime > 6000) {
    //        return;
        }
        requestAnimationFrame(render);

        var angle = _now * REVS_PER_SECOND * 2 * Math.PI / 1000;
        camera.position.set(MID_X + EYE_DISTANCE * Math.cos(angle), MID_Y + EYE_HEIGHT, MID_Z + EYE_DISTANCE * Math.sin(angle));

        camera.lookAt(new THREE.Vector3(MID_X, MID_Y, MID_Z));

        lines.forEach(function(line) {
            line.addPoint();
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
        new Line(0xff0000, startPoint),
        new Line(0x00ff00, startPoint2),
        new Line(0x0000ff, startPoint3)
    ];
    lines.forEach(function(line){
        scene.add(line.mesh);
    });

    var axes = new Axes();
    scene.add(axes.mesh);

    var startTime = now();
    render();
})();
