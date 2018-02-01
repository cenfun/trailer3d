define(function() {
    "use strict";

    var THREE = require("THREE");
    var OptionBase = require("../core/option-base.js");
    var Tween = require("../tween/tween.js");

    var vertexShader = require("./shader/cloud.vsh");
    var fragmentShader = require("./shader/cloud.fsh");
    //console.log(vertexShader, fragmentShader);

    var Trailer3D = OptionBase.extend({

        completed: false,

        mouseX: 0,
        mouseY: 0,

        constructor: function(container) {
            this.initRequestAnimationFrame();
            this.initContainer(container);
            this.init3D();
            this.resize();
        },

        initContainer: function(container) {
            if (!container) {
                container = document.createElement("div");
                container.style.width = "100%";
                container.style.height = "100%";
                document.body.appendChild(container);
            }
            this.container = container;

            var self = this;
            this.container.addEventListener('mousemove', function(e) {
                self.onMousemove(e);
            }, false);
        },

        onMousemove: function(e) {
            this.mouseX = (e.clientX - this.width * 0.5) * 0.25;
            this.mouseY = (e.clientY - this.height * 0.5) * 0.15;
        },

        initBackground: function() {
            var canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = this.height;
            var context = canvas.getContext('2d');
            var gradient = context.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, "#1e4877");
            gradient.addColorStop(0.5, "#4584b4");
            context.fillStyle = gradient;
            context.fillRect(0, 0, canvas.width, canvas.height);

            this.container.style.background = 'url(' + canvas.toDataURL('image/png') + ')';
            this.container.style.backgroundSize = '32px 100%';
        },

        init3D: function() {

            this.renderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: true
            });

            this.scene = new THREE.Scene();

            this.initCamera();

        },

        initCamera: function() {
            var camera = new THREE.PerspectiveCamera(35, 1, 1, 10000);
            camera.position.x = 0;
            camera.position.y = 20;
            camera.position.z = 200;
            //camera.up.x = 0;
            //camera.up.y = 0;
            //camera.up.z = 0;
            camera.lookAt(0, 0, -20);
            this.camera = camera;
        },

        resize: function() {
            var w = this.container.clientWidth;
            var h = this.container.clientHeight;
            if (!h) {
                return;
            }

            this.width = w;
            this.height = h;

            this.initBackground();

            this.renderer.setSize(w, h);

            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();

        },

        //===========================================================================

        addLight: function() {
            //var alight = new THREE.AmbientLight(0xffffff, 1);
            //alight.position.set(100, 100, 200);
            //this.scene.add(alight);

            var dlight = new THREE.DirectionalLight(0xffffff);
            dlight.position.set(0, 5, 5);
            this.scene.add(dlight);

            //var plight = new THREE.PointLight(0xFF0000);
            //plight.position.set(0, 0, 50);
            //this.scene.add(plight);

        },

        addAxis: function() {

            var axes = new THREE.AxesHelper(10);
            this.scene.add(axes);

            /*
            var materialx = new THREE.LineBasicMaterial({
                color: 0xff0000
            });
            var geometryx = new THREE.Geometry();
            geometryx.vertices.push(new THREE.Vector3(-5, 0, 0));
            geometryx.vertices.push(new THREE.Vector3(5, 0, 0));
            var linex = new THREE.Line(geometryx, materialx, THREE.LineSegments);
            this.scene.add(linex);

            var materialy = new THREE.LineBasicMaterial({
                color: 0x00ff00
            });
            var geometryy = new THREE.Geometry();
            geometryy.vertices.push(new THREE.Vector3(0, -5, 0));
            geometryy.vertices.push(new THREE.Vector3(0, 5, 0));
            var liney = new THREE.Line(geometryy, materialy, THREE.LineSegments);
            this.scene.add(liney);

            var materialz = new THREE.LineBasicMaterial({
                color: 0x0000ff
            });
            var geometryz = new THREE.Geometry();
            geometryz.vertices.push(new THREE.Vector3(0, 0, -5));
            geometryz.vertices.push(new THREE.Vector3(0, 0, 5));
            var linez = new THREE.Line(geometryz, materialz, THREE.LineSegments);
            this.scene.add(linez);
            */

        },

        addMesh: function() {
            var geometry = new THREE.CubeGeometry(1, 1, 1, 4, 4);
            var material = new THREE.MeshLambertMaterial({
                color: 0xFFFFFF
            });
            var mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(-1, 0, 0);
            this.scene.add(mesh);
            this.mesh = mesh;
        },

        addCube: function() {
            var geometry = new THREE.CubeGeometry(1, 1, 1);
            var material = new THREE.MeshLambertMaterial({
                color: 0xFFFFFF
            });
            this.cube = new THREE.Mesh(geometry, material);
            this.cube.position.set(1, 0, 0);
            this.scene.add(this.cube);
        },

        addCloud: function() {

            //=====================================================================
            var geometry = new THREE.Geometry();
            var plane = new THREE.Mesh(new THREE.PlaneGeometry(64, 64));

            var deep = 100;
            var width = 1000;
            var height = 20;

            for (var i = 0; i < deep; i++) {

                plane.position.x = (Math.random() - 0.5) * width;
                plane.position.y = (Math.random() - 0.5) * height;
                plane.position.z = i;

                plane.rotation.z = Math.random() * Math.PI;

                plane.scale.x = Math.random() * Math.random() * 1.5 + 0.5;
                plane.scale.y = plane.scale.x;

                geometry.mergeMesh(plane);

            }

            //=====================================================================
            var textureLoader = new THREE.TextureLoader();
            var texture = textureLoader.load('textures/cloud0.png');
            texture.magFilter = THREE.LinearMipMapLinearFilter;
            texture.minFilter = THREE.LinearMipMapLinearFilter;

            var fog = new THREE.Fog(0x4584b4, -100, 3000);

            var material = new THREE.ShaderMaterial({
                uniforms: {
                    map: {
                        type: "t",
                        value: texture
                    },
                    fogColor: {
                        type: "c",
                        value: fog.color
                    },
                    fogNear: {
                        type: "f",
                        value: fog.near
                    },
                    fogFar: {
                        type: "f",
                        value: fog.far
                    }
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                depthWrite: false,
                depthTest: false,
                transparent: true
            });


            //=====================================================================
            //this.cloud1 = new THREE.Mesh(geometry, material);
            //this.scene.add(this.cloud1);

            this.cloud2 = new THREE.Mesh(geometry, material);
            this.cloud2.position.z = -deep;
            this.scene.add(this.cloud2);
        },


        addShape: function() {

            var total = 1000;

            this.deep = 1000;

            this.list = [];

            for (var i = 0; i < total; i++) {

                var sphereGeometry = new THREE.SphereBufferGeometry(1, 10, 10);
                var sphereMaterial = new THREE.MeshLambertMaterial({
                    transparent: true,
                    //opacity: 0,
                    color: 0xffffff
                });
                var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                sphere.position.x = this.width * (Math.random() - 0.5);
                sphere.position.y = this.height * (Math.random() - 0.5);
                sphere.position.z = this.deep * (Math.random() - 0.5);
                this.scene.add(sphere);
                this.list.push(sphere);
            }

        },

        //===========================================================================
        initScene: function() {

            this.addLight();

            this.addAxis();

            //this.addMesh();
            //this.addCube();

            //this.addCloud();

            this.addShape();


            this.container.appendChild(this.renderer.domElement);

            this.initTween();

        },

        flyIn: function() {
            this.flyType = "in";
            this.from = {
                shakeOffset: -10,
                opacity: 0,
                list: []
            };

            this.till = {
                shakeOffset: 10,
                opacity: 1,
                list: []
            };

            var shape = this.story[0].shape;
            var shapeData = shape.shapeData;

            for (var i = 0, l = shapeData.length; i < l; i++) {

                var item = this.list[i];
                this.from.list[i] = {
                    x: item.position.x,
                    y: item.position.y,
                    z: item.position.z
                };

                var p = shapeData[i];

                this.till.list[i] = {
                    x: p.x - shape.width * 0.5,
                    y: -p.y + shape.height * 0.5,
                    z: 0
                };

            }

            this.tween.start({
                easing: "Sinusoidal.InOut",
                duration: 1000,
                from: this.from,
                till: this.till
            });
        },

        flyOut: function() {
            this.flyType = "out";
            this.from = {
                shakeOffset: 10,
                opacity: 1,
                list: []
            };

            this.till = {
                shakeOffset: -10,
                opacity: 0,
                list: []
            };

            var shape = this.story[0].shape;
            var shapeData = shape.shapeData;

            for (var i = 0, l = shapeData.length; i < l; i++) {
                var item = this.list[i];

                this.from.list[i] = {
                    x: item.position.x,
                    y: item.position.y,
                    z: item.position.z
                };

                //var p = shapeData[i];

                this.till.list[i] = {
                    x: this.width * (Math.random() - 0.5),
                    y: this.height * (Math.random() - 0.5),
                    z: this.deep * (Math.random() - 0.5)
                };

            }

            this.tween.start({
                easing: "Sinusoidal.InOut",
                duration: 1000,
                from: this.from,
                till: this.till
            });
        },


        initTween: function() {

            this.tween = new Tween();
            var self = this;
            this.tween.bind("onUpdate", function(e, d) {
                self.data = d;
            }).bind("onComplete", function(e, d) {
                setTimeout(function() {
                    if (self.flyType === "in") {
                        self.flyOut();
                    } else {
                        self.flyIn();
                    }
                }, 3000);
            });

            this.flyIn();
        },

        //===========================================================================

        render: function() {
            this.trigger("onRenderStart");

            this.tween.update();

            //this.positionZ -= 1;

            //console.log(this.positionZ);


            //var camera = this.camera;
            //camera.position.x += (this.mouseX - camera.position.x) * 0.01;
            //camera.position.y += (-this.mouseY - camera.position.y) * 0.01;
            //camera.position.z = this.positionZ;

            //this.camera.position.x = this.data.shakeOffset;

            for (var i = 0, l = this.list.length; i < l; i++) {
                var item = this.list[i];

                var p = this.data.list[i];
                if (p) {
                    item.position.x = p.x;
                    item.position.y = p.y;
                    item.position.z = p.z;
                    //item.material.opacity = this.data.opacity;
                }
            }

            /*
            if (this.cube) {
                this.cube.rotation.x += 0.02;
                this.cube.rotation.y += 0.02;
            }

            if (this.mesh) {
                this.mesh.rotation.x += 0.02;
                this.mesh.rotation.y += 0.02;
            }
            */

            this.renderer.render(this.scene, this.camera);

            this.trigger("onRenderComplete");

            this.play();
        },

        play: function() {

            var self = this;
            this.time_loop = requestAnimationFrame(function() {
                self.render();
            });

        },

        stop: function() {
            cancelAnimationFrame(this.time_loop);
        },

        //===========================================================================

        start: function(story) {
            this.completed = false;
            this.initStory(story);
            if (!this.story.length) {
                return;
            }

            this.positionZ = 0;

            this.initScene();

            this.play();
        },

        //===========================================================================

        initStory: function(story) {
            this.story = [];
            if (!story || !story.length) {
                return;
            }
            for (var i = 0, l = story.length; i < l; i++) {
                var item = story[i];
                if (!item) {
                    continue;
                }
                this.initItem(item);
            }
        },

        initItem: function(item) {
            var defaultItem = {
                delay: 0,
                duration: 0,
                content: "",
                font: "bold 20px Arial",
                type: "text"
            };

            for (var k in defaultItem) {
                if (typeof(item[k]) === "undefined") {
                    item[k] = defaultItem[k];
                }
            }

            var shape = this.createShape(item);
            if (!shape) {
                return;
            }
            item.shape = shape;
            this.story.push(item);
        },

        //===========================================================================

        createShape: function(item) {
            //===========================================
            var div = document.createElement("div");
            div.style.position = "absolute";
            div.style.top = "0px";
            div.style.left = "0px";
            div.style.color = "#ff0000";
            div.style.font = item.font;
            div.style.zIndex = 10;
            div.innerText = item.content;
            this.container.appendChild(div);
            //===========================================

            var width = div.clientWidth;
            var height = div.clientHeight;

            this.container.removeChild(div);

            var canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            canvas.style.position = "absolute";
            canvas.style.top = "0px";
            canvas.style.left = "0px";
            canvas.style.background = "#f5f5f5";
            this.container.appendChild(canvas);

            var ctx = canvas.getContext('2d');
            ctx.font = item.font;
            //all center to fix padding
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.fillText(item.content, width * 0.5, height * 0.5);

            var shapeData = [];

            var imageData = ctx.getImageData(0, 0, width, height);
            var dataList = imageData.data;

            console.log("width,height,area(w*h)", width, height, width * height);
            console.log("area*4(rgba)", dataList.length, width * height * 4);

            for (var y = 0; y < height; y++) {
                for (var x = 0; x < width; x++) {
                    var i = (y * width + x) * 4;
                    //console.log(x, y, i);
                    var r = dataList[i];
                    var g = dataList[i + 1];
                    var b = dataList[i + 2];
                    var a = dataList[i + 3];
                    //console.log(r, g, b, a);
                    //black color, alpha !== 0
                    if (a !== 0) {
                        //test red
                        dataList[i] = 255;
                        //dataList[i + 1] = 255;
                        //dataList[i + 2] = 255;
                        //dataList[i + 3] = 255;
                        //console.log(a);
                        var opacity = Number((a / 255).toFixed(2));
                        //console.log(opacity);
                        shapeData.push({
                            color: 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')',
                            opacity: opacity,
                            x: x,
                            y: y
                        });
                    }
                }
            }
            ctx.putImageData(imageData, 0, 0);
            console.log("shapeData", shapeData.length);
            var shape = {
                width: width,
                height: height,
                shapeData: shapeData
            };
            return shape;
        },

        //init requestAnimationFrame
        initRequestAnimationFrame: function() {
            var pre = ["webkit", "moz", "ms"];
            for (var i = 0; i < pre.length; i++) {
                var item = pre[i];
                if (!window.requestAnimationFrame) {
                    window.requestAnimationFrame = window[item + "RequestAnimationFrame"];
                    window.cancelAnimationFrame = window[item + "CancelAnimationFrame"];
                }
            }
            // window.requestAnimationFrame diffrent params with window.setTimeout;
            if (!window.cancelAnimationFrame) {
                window.cancelAnimationFrame = window.clearTimeout;
            }
        },

        toString: function() {
            return "Trailer3D";
        }

    });


    return Trailer3D;

});