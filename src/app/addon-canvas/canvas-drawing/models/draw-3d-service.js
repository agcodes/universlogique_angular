import {
    LineBasicMaterial,
    ArrowHelper,
    AmbientLight,
    PointLight,
    Vector2,
    Vector3,
    AxesHelper,
    DirectionalLight,
    DoubleSide,
    PointsMaterial,
    BufferGeometry,
    Float32BufferAttribute,
    Points,
    Mesh,
    MeshBasicMaterial,
    MeshPhongMaterial,
    MeshPhysicalMaterial,
    EdgesGeometry,
    MeshStandardMaterial,
    LineSegments,
    BoxGeometry,
    SphereGeometry,
    BoxHelper,
    TubeGeometry,
    Line,
    LineCurve3,
    CurvePath,
    CatmullRomCurve3,
    Shape,
    ExtrudeGeometry
} from 'three';

import ParametricGeometry from './ParametricGeometry';
import { ParametrizedCurve } from './ParametrizedCurve';

export default class Draw3dService {
    scene = null;
    pX = 10;
    width = 10;
    height = 10;
    depth = 10;
    convertZ = true;
    limitWidth = 0;
    limitHeight = 0;
    normalized = false;
    inverseY = false;
    ptMin = [];

    setNormalized(limits, marginCoef) {
        this.normalized = true;
        this.ptMin = limits[0];
        this.ptMax = limits[1];
        this.normalized = true;
        this.width = this.width * marginCoef[0];
        this.height = this.height * marginCoef[1];
        this.depth = this.depth * marginCoef[2];
    }
    getNormalizeFunction() {
        return (pt) => this.normalizePoint(pt);
    }
    getScale() {
        const curveWidth = this.ptMax[0] - this.ptMin[0];
        const curveHeight = this.ptMax[1] - this.ptMin[1];
        const curveDepth = this.ptMax[2] - this.ptMin[2];

        const scaleX = this.limitWidth / curveWidth;
        const scaleY = this.limitHeight / curveHeight;
        const scaleZ = Math.min(scaleX, scaleY);
        return scaleZ;
    }
    setLimits(w, h) {
        this.limitWidth = w;
        this.limitHeight = h;
    }
    addObject(obj) {
        if (this.scene && this.scene.isScene) {
            this.scene.add(obj);
            return true;
        }
        return false;
    }
    addDirectionalLight(color, intensity) {
        const light = new DirectionalLight(color, intensity);
        light.position.set(0, 1, 0).normalize();
        return this.addObject(light);
    }
    addAmbientLight(color, intensity) {
        return this.addObject(new AmbientLight(color, intensity));
    }
    AddPointLight(color, intensity) {
        // Adding a light to better see the object
        const light = new PointLight(color, intensity);
        light.position.set(10, 10, 10);
        this.addObject(light);
    }
    drawCustomFunctionTube(color, size, parametrizedFuncion, args, nbSegments) {
        const path = new ParametrizedCurve(1, parametrizedFuncion, this.getNormalizeFunction(), args, this.limitWidth, this.limitHeight, this.pX);
        const geometry = new TubeGeometry(path, nbSegments, size, 16, false);
        //const material = new MeshBasicMaterial({ color: color });
        // Utilisation d'un matériau réactif à la lumière
        const material = new MeshStandardMaterial({
            color: color,
            roughness: 0.4   // Ajuste la rugosité pour un effet brillant
        });

        const mesh = new Mesh(geometry, material);
        this.addObject(mesh);
    }
    drawTube(pts, color, size, convert, catmull) {
        if (convert === true) {
            pts = this.convertPoints(pts, this.limitWidth, this.limitHeight, false);
        }

        // Create an array of vectors from the points
        const vectors = pts.map(pt => new Vector3(pt[0], pt[1], pt[2]));

        if (catmull) {
            // Créez une courbe à partir des vecteurs
            const curve = new CatmullRomCurve3(vectors);

            // Créez une TubeGeometry à partir de la courbe
            const tubeGeometry = new TubeGeometry(curve, vectors.length / 10, size, 8, false);

            // Créez un matériau
            const material = new MeshBasicMaterial({ color: color });

            // Créez un maillage à partir de la géométrie et du matériau
            const tube = new Mesh(tubeGeometry, material);

            // Ajoutez le maillage à la scène
            this.addObject(tube);

            return;
        }
        else {
            // Create a path from the vectors
            const path = new CurvePath();
            vectors.forEach((vector, i) => {
                if (i < vectors.length - 1) {
                    path.add(new LineCurve3(vector, vectors[i + 1]));
                }
            });

            // Create the tube geometry following the path
            const tubeGeometry = new TubeGeometry(path, vectors.length, size, 16, false);  // 2 is the tube radius, 8 segments

            // Create a material with the given color
            const material = new MeshBasicMaterial({ color: color, wireframe: true });

            // Create a mesh of the tube
            const tube = new Mesh(tubeGeometry, material);

            // Add the tube to the scene
            this.addObject(tube);

            return;
        }
    }
    drawLine(pts, color, convert) {
        if (convert === true) {
            pts = this.convertPoints(
                pts,
                this.limitWidth,
                this.limitHeight,
                false
            );
        }

        const vectors = [];

        pts.forEach(pt => vectors.push(new Vector3(pt[0], pt[1], pt[2])));

        return this.addObject(
            new Line(
                new BufferGeometry().setFromPoints(vectors),
                new LineBasicMaterial({
                    color: color,
                    // 'side: DoubleSide' means the line will be visible from both sides.
                    side: DoubleSide,
                    // 'opacity: 1' sets the opacity of the line to 100%.
                    opacity: 1,
                    // enables fog in the scene for the line.
                    fog: true,
                }),
            ),
        );
    }
    drawPoints(pts, color, size, convert, inverseY, multiColor, opacity) {
        if (convert === true) {
            pts = this.convertPoints(
                pts,
                this.limitWidth,
                this.limitHeight,
                inverseY,
            );
            pts.splice(0, 2);
        }

        //console.log(pts);
        const vertices = pts
            .map((pt) => {
                if (pt[2] === null) {
                    pt[2] = 0;
                }
                return pt.slice(0, 3);
            })
            .flat();

        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        if (multiColor) {
            const colorsArray = pts.map((pt) => pt[3]).flat();
            if (colorsArray.length == pts.length * 3) {
                geometry.setAttribute(
                    'color',
                    new Float32BufferAttribute(colorsArray, 3),
                );
                this.addObject(
                    new Points(
                        geometry,
                        new PointsMaterial({
                            vertexColors: true,
                            size: size,
                            fog: false,
                            transparent: false
                        }),
                    ),
                );
            }
        } else if (color && typeof opacity !== 'undefined') {
            this.addObject(
                new Points(
                    geometry,
                    new PointsMaterial({
                        color: color,
                        size: size,
                        transparent: true,
                        opacity: opacity,
                    }),
                ),
            );
        } else if (color) {
            this.addObject(
                new Points(
                    geometry,
                    new PointsMaterial({
                        color: color,
                        size: size,
                    }),
                ),
            );
        }
        geometry.dispose();
        return true;
    }
    drawPoint(pt, color, size) {
        const bufferGeometry = new BufferGeometry();
        bufferGeometry.setAttribute(
            'position',
            new Float32BufferAttribute([pt[0], pt[1], pt[2]], 3),
        );

        return this.addObject(
            new Points(
                bufferGeometry,
                new PointsMaterial({
                    color: color,
                    size: size,
                }),
            ),
        );
    }
    drawSphere(color, size) {
        const obj = this.getSphere(color, size);
        return this.addObject(obj);
    }
    getSphere(color, size) {
        // obj.castShadow = true;
        return new Mesh(
            new SphereGeometry(size, 10, 32),
            new MeshPhongMaterial({
                color: color,
                transparent: false,
                opacity: 1,
                castShadow: true,
            }),
        );
    }
    drawCubes(pts, color) {
        const geometry = new BoxGeometry(0.04, 0.04);
        const material = new MeshPhongMaterial({
            color: color,
            transparent: false,
            opacity: 1,
            castShadow: true,
        });

        for (let i = 0; i < pts.length; i++) {
            const cube = new Mesh(geometry, material);
            //console.log(pts[i][0], pts[i][1], pts[i][2], color);
            cube.position.set(pts[i][0], pts[i][1], pts[i][2]);
            this.addObject(cube);
        }
        return true;
    }
    drawBoxHelper() {
        const object = new Mesh(new SphereGeometry(), new MeshBasicMaterial(0xff0000));
        return this.addObject(new BoxHelper(object, 0xffff00));
    }
    drawCubeHelper() {
        const geometry = new BoxGeometry(this.width, this.height, this.depth); // green
        const material = new MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        const cube = new Mesh(geometry, material);
        this.addObject(cube);
    }

    drawCube(x, y, z, color, linewidth) {

        // Création du cube avec un matériau transparent
        const cubeGeometry = new BoxGeometry(x, y, z);
        const cubeMaterial = new MeshPhysicalMaterial({
            color: color,
            metalness: 0.7,
            roughness: 0.2,
            opacity: 0.5,
            transparent: true
        });
        const cube = new Mesh(cubeGeometry, cubeMaterial);
        this.addObject(cube);

        // Ajout des arêtes colorées
        const edgesGeometry = new EdgesGeometry(cubeGeometry);
        const edgesMaterial = new LineBasicMaterial({ color: color, linewidth: linewidth });
        const edges = new LineSegments(edgesGeometry, edgesMaterial);
        this.addObject(edges);
    }
    drawArrowHelper() {
        const dir = new Vector3(1, 2, 0);

        //normalize the direction vector (convert to vector of length 1)
        dir.normalize();

        const origin = new Vector3(0, 0, 0);
        const length = 1;
        // yellow
        const hex = 0xffff00;

        const arrowHelper = new ArrowHelper(dir, origin, length, hex);
        return this.addObject(arrowHelper);
    }
    drawAxesHelper() {
        const axesHelper = new AxesHelper(5);
        return this.addObject(axesHelper);
    }
    drawMultiColorsPath(pts, convert) {
        if (convert === true) {
            pts = this.convertPoints(pts, this.limitWidth, this.limitHeight, false);
        }

        const vectors = pts.map(
            (point) => new Vector3(point[0], point[1], point[2]),
        );

        const numSegments = vectors.length; // Augmentez ce nombre si nécessaire
        const geometry = new BufferGeometry().setFromPoints(vectors, numSegments);

        // Create an array to store the color for each vertex of the line
        const colors = pts.map((point) => point[3]);
        const colorsArray = colors.flat();

        // Set colors attribute to the geometry
        geometry.setAttribute('color', new Float32BufferAttribute(colorsArray, 3));

        // Create LineSegments with LineBasicMaterial for a continuous line

        return this.addObject(
            new LineSegments(
                geometry,
                new LineBasicMaterial({
                    vertexColors: true,
                    opacity: 1,
                    fog: true,
                }),
            ),
        );
    }
    convertPoints(pts, w, h, inverseY) {
        if (this.normalized == true) {
            return this.normalizePoints(pts);
        }
        return pts.map((point) => this.convertPoint(point, w, h, inverseY, 10000));
    }
    normalizePoints(pts) {
        return pts.map((point) => this.normalizePoint(point));
    }
    normalizePoint(pt) {
        if (this.normalized == true) {
            if (pt && pt[0] != null && pt[1] != null) {
                pt[0] = (this.ptMax[0] == this.ptMin[0]) ? 0 : ((pt[0] - this.ptMin[0]) / (this.ptMax[0] - this.ptMin[0])) * this.width - this.width / 2;
                pt[1] = (this.ptMax[1] == this.ptMin[1]) ? 0 : ((pt[1] - this.ptMin[1]) / (this.ptMax[1] - this.ptMin[1])) * this.height - this.height / 2;
                if (this.inverseY === true) {
                    pt[1] = pt[1] * -1;
                }
            }

            if (pt[2] != null) {
                pt[2] = (this.ptMax[2] == this.ptMin[2]) ? 0 : ((pt[2] - this.ptMin[2]) / (this.ptMax[2] - this.ptMin[2])) * this.depth - this.depth / 2;
            }
            else {
                pt[2] = this.depth / 2;
            }
        }
        return pt;
    }
    convertPoint(pt, w, h, inverseY, d) {
        const p = this.pX * 1.2;
        pt[0] = (pt[0] / w) * p * 2 - p;
        pt[1] = (pt[1] / h) * p * 2 - p;

        if (this.convertZ === true && pt[2]) {
            pt[2] = (pt[2] / h) * p * 2 - p;
        }

        if (inverseY === true) {
            pt[1] = pt[1] * -1;
        }
        return pt;
    }
    addParametricSurface(f, slices, stacks, color, materialType) {
        const geometry = new ParametricGeometry(f, slices, stacks);
        let material;

        if (materialType === "mesh-pong") {
            material = new MeshPhongMaterial({
                color: color,
                wireframe: true,
                shininess: 100,
                specular: 0xffffff
            });
        } else {
            material = new MeshStandardMaterial({
                color: color,
                wireframe: true,
                emissive: color,
                metalness: 0.8,
                roughness: 0.3
            });
        }

        return this.addObject(new Mesh(geometry, material));
    }
    drawCatmullRomCurve(pts, color, convert) {
        if (convert === true) {
            pts = this.convertPoints(pts, this.limitWidth, this.limitHeight, false);
        }
        const vectors = [];

        if (pts.length == 0) {
            return true;
        }
        for (let i = 0; i < pts.length; i++) {
            if (pts[i][0]
                && pts[i][0]
                && pts[i][1]
                && pts[i][2]
                && pts[i][0] != Infinity
                && pts[i][1] != Infinity
                && pts[i][2] != Infinity
                && pts[i][0] != -Infinity
                && pts[i][1] != -Infinity
                && pts[i][2] != -Infinity
                && !isNaN(pts[i][0])
                && !isNaN(pts[i][1])
                && !isNaN(pts[i][2])) {
                vectors.push(new Vector3(pts[i][0], pts[i][1], pts[i][2]));
            }
        }

        const spline = new CatmullRomCurve3(vectors);
        spline.type = 'catmullrom';
        spline.tension = 0.5;

        const extrudeSettings = {
            steps: Math.floor(vectors.length / 2),
            bevelEnabled: false,
            extrudePath: spline
        };

        const shaped = [];
        const width = 0.03;

        shaped.push(new Vector2(0, 0));
        shaped.push(new Vector2(width, 0));
        shaped.push(new Vector2(width, width));
        shaped.push(new Vector2(0, width));

        const shape = new Shape(shaped);
        const geometry = new ExtrudeGeometry(shape, extrudeSettings);
        const material = new MeshBasicMaterial({
            color: color
        });

        /*const material = new MeshLambertMaterial({
            color: 0xff0000,
            flatShading: true,
            vertexColors: false
        });*/
        const mesh = new Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = false;
        this.addObject(mesh);
        return true;
    }
    drawCatmullRomCurve_(points, convert) {
        const scale = 1;
        const vectors = [];
        if (convert === true) {
            points = this.convertPoints(points, this.limitWidth, this.limitHeight, false);
        }
        for (let i = 0; i < points.length; i++) {
            if (points[i][0] && points[i][1]) {
                // add new vector to the geometry
                vectors.push(new Vector3(points[i][0] * scale, points[i][1] * scale, points[i][2] * scale));
            }
        }
    }
}