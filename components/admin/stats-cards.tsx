import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsCardsProps {
  total: number;
  approved: number;
  pending: number;
  averageRoi: number;
}

export function StatsCards({ total, approved, pending, averageRoi }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Total Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{total}</div>
        </CardContent>
      </Card>
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Approved Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-green-500">{approved}</div>
        </CardContent>
      </Card>
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Pending Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-yellow-500">{pending}</div>
        </CardContent>
      </Card>
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Average ROI</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-blue-500">
            {averageRoi}%
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
