<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { timeDisplay } from '../utils/utils';
	export let startTime: number;
	export let text: string;
	export let active: boolean = false;

	const dispatch = createEventDispatcher();
	function handleClick() {
		dispatch('click');
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="subtitle {active ? 'active-subtitle' : 'inactive-subtitle'}"
	tabindex="-1"
	on:click={handleClick}
>
	<span class="subtitle-time">{timeDisplay(startTime)}&nbsp;</span>
	<span
		class="subtitle-text {active
			? 'active-subtitle-text'
			: 'inactive-subtitle-text'}"
	>
		{text}
	</span>
</div>

<style>
	.subtitle {
		cursor: pointer;
		border-radius: 3px;
		padding: 5px 0;
		width: 100%;
	}

	.subtitle-time {
		user-select: none;
		pointer-events: none;
		font-size: small;
		color: #888888;
	}

	.subtitle:focus {
		outline: none;
	}

	.inactive-subtitle:hover {
		background-color: #333333;
	}

	.active-subtitle {
		animation-name: active-subtitle-animation;
		animation-duration: 0.1s;
		animation-fill-mode: forwards;
	}

	@keyframes active-subtitle-animation {
		from {
			background-color: inherit;
		}
		to {
			background-color: #000088;
		}
	}

	.active-subtitle-text {
		font-weight: bold;
	}
</style>
