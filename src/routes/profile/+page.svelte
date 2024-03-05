<script lang="ts">
	import { goto } from '$app/navigation';
	import type { User } from '$lib/db/types.js';

    export let data;

    let user = data.user as User;

    const handlelogout = async () => {
        await fetch('/api/auth/logout', {
            method: 'POST'
        });

        goto('/auth');
    }
</script>

<div class="flex items-center justify-center flex-col h-full w-full">
    <div class="rounded-lg border bg-card shadow-sm w-full max-w-sm mx-auto ">

        <div class="flex justify-start items-center p-2">
            <!-- logout icon -->
            <button on:click={() => handlelogout()}>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 8v-2a2 2 0 0 1 2 -2h7a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-2" /><path d="M15 12h-12l3 -3" /><path d="M6 15l-3 -3" /></svg>
            </button>
        </div>
        <div class="space-y-1.5 flex flex-col items-center p-6">
          <h3 class="text-2xl font-semibold whitespace-nowrap leading-none tracking-tight mt-4">Profile</h3>
        </div>
        <div class="flex flex-col items-center p-6">
          <span class="relative flex shrink-0 overflow-hidden rounded-full border h-24 w-24">
            <img class="aspect-square h-full w-full" alt="@shadcn" src={user?.image_url} />
            <span class="flex h-full w-full items-center justify-center rounded-full bg-muted">JD</span>
          </span>
          <div class="grid gap-0.5 text-sm text-center">
            <div class="font-medium">{user?.name}</div>
            <div class="text-gray-500 dark:text-gray-400">{user?.email}</div>
          </div>
        </div>
      </div>    
</div>

