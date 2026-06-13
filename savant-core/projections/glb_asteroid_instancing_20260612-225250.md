# GLB Asteroid Instancing

Applied:
- source asset: public/assets/ast/ast.glb
- removed procedural dodecahedron asteroid generation from active scene
- loaded real GLB with GLTFLoader
- extracted first mesh
- centered geometry
- reused one source geometry
- reused one source material
- rendered one hero asteroid mesh
- rendered asteroid field through THREE.InstancedMesh
- preserved parallax starfield and cinematic lighting

Result:
- asteroids now use the uploaded GLB asset instead of synthetic low-poly generated geometry
