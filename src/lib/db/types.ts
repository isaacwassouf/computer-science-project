export type User =
	| {
			id: number;
			email: string;
			name: string;
			image_url: string | null;
	  }
	| undefined;
