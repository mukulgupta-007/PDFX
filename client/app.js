document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop_zone');
    const fileInput = document.getElementById('fileInput');
    const uploadForm = document.getElementById('uploadForm');
    const preview = document.getElementById('preview');

    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragging');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragging');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragging');
            const files = e.dataTransfer.files;
            handleFiles(files);
        });
    }

    if (uploadForm) {
        uploadForm.addEventListener('submit', (e) => {
            if (fileInput.files.length < 2) {
                e.preventDefault();
                alert('Please upload at least two PDF files.');
            } else {
                const orderInput = document.createElement('input');
                orderInput.type = 'hidden';
                orderInput.name = 'order';
                orderInput.value = Array.from(fileInput.files).map((_, index) => index + 1).join(',');
                uploadForm.appendChild(orderInput);
            }
        });
    }

    function handleFiles(files) {
        const dataTransfer = new DataTransfer();
        for (let i = 0; i < fileInput.files.length; i++) {
            dataTransfer.items.add(fileInput.files[i]);
        }
        for (let i = 0; i < files.length; i++) {
            dataTransfer.items.add(files[i]);
        }
        fileInput.files = dataTransfer.files;
        updatePreview();
    }

    function updatePreview() {
        preview.innerHTML = '';
        Array.from(fileInput.files).forEach((file, index) => {
            const previewItem = document.createElement('div');
            previewItem.classList.add('preview-item');
            previewItem.draggable = true;
            previewItem.dataset.index = index;

            const fileReader = new FileReader();
            fileReader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                previewItem.appendChild(img);

                const fileName = document.createElement('div');
                fileName.classList.add('file-name');
                fileName.textContent = file.name;
                previewItem.appendChild(fileName);
            };
            fileReader.readAsDataURL(file);

            previewItem.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', index);
                previewItem.classList.add('dragging');
            });

            previewItem.addEventListener('dragend', () => {
                previewItem.classList.remove('dragging');
            });

            previewItem.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            previewItem.addEventListener('drop', (e) => {
                e.preventDefault();
                const draggedIndex = e.dataTransfer.getData('text/plain');
                const targetIndex = previewItem.dataset.index;
                reorderFiles(draggedIndex, targetIndex);
                updatePreview();
            });

            preview.appendChild(previewItem);
        });
    }

    function reorderFiles(fromIndex, toIndex) {
        const files = Array.from(fileInput.files);
        const [movedFile] = files.splice(fromIndex, 1);
        files.splice(toIndex, 0, movedFile);

        const dataTransfer = new DataTransfer();
        files.forEach(file => dataTransfer.items.add(file));
        fileInput.files = dataTransfer.files;
    }
});
