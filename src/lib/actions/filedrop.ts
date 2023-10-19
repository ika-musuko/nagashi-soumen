export function filedrop(node: HTMLElement) {
	function dispatch(name: string, detail: any) {
		node.dispatchEvent(new CustomEvent(name, { detail: detail }));
	}

	// preventDefault of dragover is needed
	// for not opening the file(s) in new tabs on drop
	function handleDragOver(event: DragEvent) {
		event.preventDefault();
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		const files: FileList | null = event.dataTransfer
			? event.dataTransfer.files
			: null;
		dispatch('filedrop', { files: files });
	}

	node.addEventListener('dragover', handleDragOver);
	node.addEventListener('drop', handleDrop);

	return {
		destroy() {
			node.removeEventListener('dragover', handleDragOver);
			node.removeEventListener('drop', handleDrop);
		}
	};
}
