'use client'

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeftRight,
  Upload,
  Play,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  SkipForward,
  Download,
  FileText,
  Loader2,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

interface MigrationResult {
  from: string
  to: string
  status: 'success' | 'not_found' | 'conflict' | 'skipped' | 'error'
  message: string
  oldUrl?: string
  newUrl?: string
}

interface MigrationResponse {
  dryRun: boolean
  stats: {
    total: number
    success: number
    notFound: number
    conflict: number
    skipped: number
    error: number
  }
  results: MigrationResult[]
}

export default function SlugMigrationPage() {
  const [csvContent, setCsvContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<MigrationResponse | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const { data: session, status } = useSession()
  const router = useRouter()

  // التحقق من الصلاحيات
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    router.push('/admin')
    return null
  }

  // تحليل CSV
  const parseCSV = (content: string): { from: string; to: string }[] => {
    const lines = content.split('\n').filter(line => line.trim())
    const migrations: { from: string; to: string }[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      // تخطي سطر العناوين
      if (i === 0 && line.toLowerCase().includes('from') && line.toLowerCase().includes('to')) {
        continue
      }

      const [from, to] = line.split(',').map(s => s?.trim() || '')
      if (from && to) {
        migrations.push({ from, to })
      }
    }

    return migrations
  }

  // تنفيذ الترحيل
  const executeMigration = async (dryRun: boolean) => {
    setIsLoading(true)
    setResponse(null)

    try {
      const migrations = parseCSV(csvContent)

      if (migrations.length === 0) {
        alert('لا توجد بيانات صالحة للترحيل')
        setIsLoading(false)
        return
      }

      const res = await fetch('/api/admin/companies/migrate-slugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ migrations, dryRun })
      })

      if (!res.ok) {
        throw new Error('فشل في تنفيذ الترحيل')
      }

      const data: MigrationResponse = await res.json()
      setResponse(data)
    } catch (error) {
      console.error('Error:', error)
      alert('حدث خطأ أثناء التنفيذ')
    } finally {
      setIsLoading(false)
    }
  }

  // نسخ الرابط
  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // تصدير التقرير
  const exportReport = () => {
    if (!response) return

    const csvRows = [
      ['Status', 'Old Slug', 'New Slug', 'Old URL', 'New URL', 'Message'].join(',')
    ]

    response.results.forEach(result => {
      csvRows.push([
        result.status,
        result.from,
        result.to,
        result.oldUrl || '',
        result.newUrl || '',
        `"${result.message}"`
      ].join(','))
    })

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `slug-migration-report-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // أيقونة الحالة
  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'not_found':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'conflict':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'skipped':
        return <SkipForward className="h-4 w-4 text-gray-400" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  // لون الـ Badge
  const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'success':
        return 'default'
      case 'not_found':
        return 'secondary'
      case 'conflict':
      case 'error':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  // فلترة النتائج حسب التبويب
  const filterResults = (tab: string) => {
    if (!response) return []
    switch (tab) {
      case 'success':
        return response.results.filter(r => r.status === 'success')
      case 'not_found':
        return response.results.filter(r => r.status === 'not_found')
      case 'conflict':
        return response.results.filter(r => r.status === 'conflict')
      case 'skipped':
        return response.results.filter(r => r.status === 'skipped')
      case 'error':
        return response.results.filter(r => r.status === 'error')
      default:
        return response.results
    }
  }

  return (
    <div className="space-y-6">
      {/* الرأس */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ArrowLeftRight className="h-8 w-8 text-blue-600" />
            ترحيل Slugs الشركات
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            تحديث روابط الشركات من ملف CSV
          </p>
        </div>
      </div>

      {/* منطقة الإدخال */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            إدخال البيانات
          </CardTitle>
          <CardDescription>
            الصق محتوى ملف CSV هنا. التنسيق المطلوب: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">from,to</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={`from,to
old-company-slug,new-company-slug
another-old-slug,another-new-slug`}
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
            dir="ltr"
          />

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => executeMigration(true)}
              disabled={isLoading || !csvContent.trim()}
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              ) : (
                <Eye className="h-4 w-4 ml-2" />
              )}
              معاينة (Dry Run)
            </Button>

            <Button
              onClick={() => {
                if (confirm('هل أنت متأكد من تنفيذ الترحيل؟ هذا الإجراء لا يمكن التراجع عنه.')) {
                  executeMigration(false)
                }
              }}
              disabled={isLoading || !csvContent.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 ml-2" />
              )}
              تنفيذ الترحيل
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* النتائج */}
      {response && (
        <>
          {/* الإحصائيات */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card className="bg-gray-50 dark:bg-gray-800">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{response.stats.total}</p>
                <p className="text-sm text-gray-500">الإجمالي</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{response.stats.success}</p>
                <p className="text-sm text-green-600">نجاح</p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">{response.stats.notFound}</p>
                <p className="text-sm text-yellow-600">غير موجود</p>
              </CardContent>
            </Card>
            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{response.stats.conflict}</p>
                <p className="text-sm text-red-600">تعارض</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 dark:bg-gray-800">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-400">{response.stats.skipped}</p>
                <p className="text-sm text-gray-500">تم تخطيه</p>
              </CardContent>
            </Card>
            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{response.stats.error}</p>
                <p className="text-sm text-red-600">أخطاء</p>
              </CardContent>
            </Card>
          </div>

          {/* تقرير مفصل */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  تقرير الترحيل
                  {response.dryRun && (
                    <Badge variant="secondary">معاينة فقط</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  تفاصيل عملية الترحيل مع الروابط القديمة والجديدة
                </CardDescription>
              </div>
              <Button onClick={exportReport} variant="outline" size="sm">
                <Download className="h-4 w-4 ml-2" />
                تصدير التقرير
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">
                    الكل ({response.stats.total})
                  </TabsTrigger>
                  <TabsTrigger value="success" className="text-green-600">
                    نجاح ({response.stats.success})
                  </TabsTrigger>
                  <TabsTrigger value="not_found" className="text-yellow-600">
                    غير موجود ({response.stats.notFound})
                  </TabsTrigger>
                  <TabsTrigger value="conflict" className="text-red-600">
                    تعارض ({response.stats.conflict})
                  </TabsTrigger>
                  <TabsTrigger value="skipped">
                    متخطى ({response.stats.skipped})
                  </TabsTrigger>
                </TabsList>

                {['all', 'success', 'not_found', 'conflict', 'skipped', 'error'].map(tab => (
                  <TabsContent key={tab} value={tab}>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[80px]">الحالة</TableHead>
                            <TableHead>Slug القديم</TableHead>
                            <TableHead>Slug الجديد</TableHead>
                            <TableHead>الرابط القديم</TableHead>
                            <TableHead>الرابط الجديد</TableHead>
                            <TableHead>الرسالة</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filterResults(tab).length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                لا توجد نتائج
                              </TableCell>
                            </TableRow>
                          ) : (
                            filterResults(tab).map((result, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <StatusIcon status={result.status} />
                                    <Badge variant={statusVariant(result.status)} className="text-xs">
                                      {result.status === 'success' && 'نجاح'}
                                      {result.status === 'not_found' && 'غير موجود'}
                                      {result.status === 'conflict' && 'تعارض'}
                                      {result.status === 'skipped' && 'متخطى'}
                                      {result.status === 'error' && 'خطأ'}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded" dir="ltr">
                                    {result.from}
                                  </code>
                                </TableCell>
                                <TableCell>
                                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded" dir="ltr">
                                    {result.to}
                                  </code>
                                </TableCell>
                                <TableCell>
                                  {result.oldUrl && (
                                    <div className="flex items-center gap-1">
                                      <a
                                        href={result.oldUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-xs truncate max-w-[150px]"
                                        dir="ltr"
                                      >
                                        {result.oldUrl}
                                      </a>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => copyToClipboard(result.oldUrl!, index)}
                                      >
                                        {copiedIndex === index ? (
                                          <Check className="h-3 w-3 text-green-500" />
                                        ) : (
                                          <Copy className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {result.newUrl && (
                                    <div className="flex items-center gap-1">
                                      <a
                                        href={result.newUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-600 hover:underline text-xs truncate max-w-[150px]"
                                        dir="ltr"
                                      >
                                        {result.newUrl}
                                      </a>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => copyToClipboard(result.newUrl!, index + 10000)}
                                      >
                                        {copiedIndex === index + 10000 ? (
                                          <Check className="h-3 w-3 text-green-500" />
                                        ) : (
                                          <Copy className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                  {result.message}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}

      {/* تعليمات */}
      <Card>
        <CardHeader>
          <CardTitle>تعليمات الاستخدام</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong>1.</strong> قم بلصق محتوى ملف CSV في مربع النص أعلاه.
          </p>
          <p>
            <strong>2.</strong> التنسيق المطلوب: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">from,to</code> (السطر الأول يمكن أن يكون عناوين).
          </p>
          <p>
            <strong>3.</strong> اضغط على "معاينة" لرؤية ما سيحدث دون تنفيذ أي تغييرات.
          </p>
          <p>
            <strong>4.</strong> بعد التأكد، اضغط على "تنفيذ الترحيل" لتطبيق التغييرات.
          </p>
          <p>
            <strong>5.</strong> سيتم تخطي الروابط التي ليست شركات تلقائياً (مثل التصنيفات والصفحات المحجوزة).
          </p>
          <p>
            <strong>6.</strong> يمكنك تصدير التقرير كملف CSV للتدقيق اليدوي.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


