/**
 * OBJExporter for Three.js r128
 * This is a stub/placeholder that provides the basic structure for OBJ export
 * For production use, include the full Three.js OBJExporter from:
 * https://github.com/mrdoob/three.js/blob/r128/examples/js/exporters/OBJExporter.js
 */

THREE.OBJExporter = function() {
    
    this.parse = function(object) {
        
        let output = '';
        let indexVertex = 0;
        let indexVertexUvs = 0;
        let indexNormals = 0;
        
        output += '# Wavefront OBJ exported by Theater-Stage\n';
        output += '# www.theater-stage.example.com\n';
        output += '\n';
        
        const materials = {};
        let materialCount = 0;
        
        function parseMesh(mesh) {
            
            let nbVertex = 0;
            let nbNormals = 0;
            let nbVertexUvs = 0;
            
            const geometry = mesh.geometry;
            
            const normalMatrixWorld = new THREE.Matrix3();
            normalMatrixWorld.getNormalMatrix(mesh.matrixWorld);
            
            // Handle BufferGeometry
            if (geometry.isBufferGeometry) {
                
                // Get attributes
                const vertices = geometry.attributes.position;
                const normals = geometry.attributes.normal;
                const uvs = geometry.attributes.uv;
                const indices = geometry.index;
                
                // Name
                output += 'o ' + (mesh.name || 'mesh') + '\n';
                
                // Vertices
                if (vertices !== undefined) {
                    for (let i = 0; i < vertices.count; i++) {
                        const vertex = new THREE.Vector3();
                        vertex.x = vertices.getX(i);
                        vertex.y = vertices.getY(i);
                        vertex.z = vertices.getZ(i);
                        vertex.applyMatrix4(mesh.matrixWorld);
                        
                        output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';
                        nbVertex++;
                    }
                }
                
                // UVs
                if (uvs !== undefined) {
                    for (let i = 0; i < uvs.count; i++) {
                        const uv = new THREE.Vector2();
                        uv.x = uvs.getX(i);
                        uv.y = uvs.getY(i);
                        
                        output += 'vt ' + uv.x + ' ' + uv.y + '\n';
                        nbVertexUvs++;
                    }
                }
                
                // Normals
                if (normals !== undefined) {
                    for (let i = 0; i < normals.count; i++) {
                        const normal = new THREE.Vector3();
                        normal.x = normals.getX(i);
                        normal.y = normals.getY(i);
                        normal.z = normals.getZ(i);
                        normal.applyMatrix3(normalMatrixWorld).normalize();
                        
                        output += 'vn ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n';
                        nbNormals++;
                    }
                }
                
                // Material
                if (mesh.material && mesh.material.name) {
                    if (!(mesh.material.name in materials)) {
                        materials[mesh.material.name] = materialCount++;
                    }
                    output += 'usemtl ' + mesh.material.name + '\n';
                }
                
                // Faces
                if (indices !== null) {
                    // Indexed geometry
                    for (let i = 0; i < indices.count; i += 3) {
                        const a = indices.getX(i) + 1;
                        const b = indices.getX(i + 1) + 1;
                        const c = indices.getX(i + 2) + 1;
                        
                        if (normals !== undefined && uvs !== undefined) {
                            output += 'f ' + 
                                (indexVertex + a) + '/' + (indexVertexUvs + a) + '/' + (indexNormals + a) + ' ' +
                                (indexVertex + b) + '/' + (indexVertexUvs + b) + '/' + (indexNormals + b) + ' ' +
                                (indexVertex + c) + '/' + (indexVertexUvs + c) + '/' + (indexNormals + c) + '\n';
                        } else if (normals !== undefined) {
                            output += 'f ' + 
                                (indexVertex + a) + '//' + (indexNormals + a) + ' ' +
                                (indexVertex + b) + '//' + (indexNormals + b) + ' ' +
                                (indexVertex + c) + '//' + (indexNormals + c) + '\n';
                        } else if (uvs !== undefined) {
                            output += 'f ' + 
                                (indexVertex + a) + '/' + (indexVertexUvs + a) + ' ' +
                                (indexVertex + b) + '/' + (indexVertexUvs + b) + ' ' +
                                (indexVertex + c) + '/' + (indexVertexUvs + c) + '\n';
                        } else {
                            output += 'f ' + (indexVertex + a) + ' ' + (indexVertex + b) + ' ' + (indexVertex + c) + '\n';
                        }
                    }
                } else {
                    // Non-indexed geometry
                    for (let i = 0; i < vertices.count; i += 3) {
                        const a = i + 1;
                        const b = i + 2;
                        const c = i + 3;
                        
                        if (normals !== undefined && uvs !== undefined) {
                            output += 'f ' + 
                                (indexVertex + a) + '/' + (indexVertexUvs + a) + '/' + (indexNormals + a) + ' ' +
                                (indexVertex + b) + '/' + (indexVertexUvs + b) + '/' + (indexNormals + b) + ' ' +
                                (indexVertex + c) + '/' + (indexVertexUvs + c) + '/' + (indexNormals + c) + '\n';
                        } else if (normals !== undefined) {
                            output += 'f ' + 
                                (indexVertex + a) + '//' + (indexNormals + a) + ' ' +
                                (indexVertex + b) + '//' + (indexNormals + b) + ' ' +
                                (indexVertex + c) + '//' + (indexNormals + c) + '\n';
                        } else if (uvs !== undefined) {
                            output += 'f ' + 
                                (indexVertex + a) + '/' + (indexVertexUvs + a) + ' ' +
                                (indexVertex + b) + '/' + (indexVertexUvs + b) + ' ' +
                                (indexVertex + c) + '/' + (indexVertexUvs + c) + '\n';
                        } else {
                            output += 'f ' + (indexVertex + a) + ' ' + (indexVertex + b) + ' ' + (indexVertex + c) + '\n';
                        }
                    }
                }
            }
            
            // Update vertex index offset
            indexVertex += nbVertex;
            indexVertexUvs += nbVertexUvs;
            indexNormals += nbNormals;
        }
        
        object.traverse(function(child) {
            if (child.isMesh) {
                parseMesh(child);
            }
        });
        
        return output;
    };
};
