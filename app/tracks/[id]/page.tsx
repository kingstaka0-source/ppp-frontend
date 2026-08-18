import TrackClient from "./TrackClient";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TrackDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <TrackClient trackId={id} />;
}